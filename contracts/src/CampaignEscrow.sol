// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title CampaignEscrow
/// @notice Presupuesto de una campaña de primera prueba, desplegado y fondeado por la MARCA.
///
/// Diseño no custodial (ver docs/04-decisiones-de-diseno.md):
/// - La plataforma nunca tiene los fondos ni puede mandarlos a cualquier lado: solo firma
///   atestaciones EIP-712 "el reclamo X es válido, pagar N a la wallet Y".
/// - Cualquiera puede enviar la atestación (relayer), pero el destino y el monto vienen firmados.
/// - Cada reclamo se paga una sola vez y nunca por encima del tope por reclamo.
/// - La marca no puede retirar antes del fin de la campaña (el presupuesto queda comprometido),
///   pero sí puede pausar los pagos o cambiar el firmante si sospecha de la plataforma.
/// - Al terminar la campaña, el remanente vuelve a la marca.
/// - La verificación de la compra ocurre fuera de la cadena; on-chain no hay datos personales,
///   solo ids de reclamo opacos.
/// - El tag de atribución ERC-8021 lo agrega el cliente de la wallet como sufijo del calldata;
///   el contrato lo ignora.
contract CampaignEscrow {
    // ---- EIP-712 ----
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant PAYOUT_TYPEHASH =
        keccak256("Payout(bytes32 claimId,address recipient,uint256 amount,uint256 deadline)");
    bytes32 private constant NAME_HASH = keccak256("CampaignEscrow");
    bytes32 private constant VERSION_HASH = keccak256("1");
    uint256 private constant HALF_N =
        0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    IERC20 public immutable token;
    address public immutable brand;
    uint256 public immutable maxPerClaim;
    uint64 public immutable endsAt;
    bytes32 public immutable campaignRef;

    address public attester;
    bool public paused;
    uint256 public totalReleased;
    mapping(bytes32 => bool) public paid;

    event Funded(address indexed from, uint256 amount);
    event Released(bytes32 indexed claimId, address indexed recipient, uint256 amount);
    event Refunded(address indexed brand, uint256 amount);
    event Paused(bool paused);
    event AttesterChanged(address indexed previous, address indexed current);

    error NotBrand();
    error IsPaused();
    error CampaignEnded();
    error CampaignNotEnded();
    error AttestationExpired();
    error AlreadyPaid(bytes32 claimId);
    error AmountTooHigh(uint256 amount, uint256 max);
    error InvalidSignature();
    error InsufficientBalance();
    error ZeroAddress();
    error TransferFailed();
    error LengthMismatch();

    modifier onlyBrand() {
        if (msg.sender != brand) revert NotBrand();
        _;
    }

    constructor(IERC20 token_, address attester_, uint256 maxPerClaim_, uint64 endsAt_, bytes32 campaignRef_) {
        if (address(token_) == address(0) || attester_ == address(0)) revert ZeroAddress();
        if (endsAt_ <= block.timestamp) revert CampaignEnded();
        token = token_;
        brand = msg.sender;
        attester = attester_;
        maxPerClaim = maxPerClaim_;
        endsAt = endsAt_;
        campaignRef = campaignRef_;
    }

    // ---------------------------------------------------------------- fondeo

    /// @notice La marca (o quien sea) aporta presupuesto. Requiere approve previo.
    function fund(uint256 amount) external {
        if (block.timestamp > endsAt) revert CampaignEnded();
        _safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(msg.sender, amount);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // ---------------------------------------------------------------- pagos

    function release(bytes32 claimId, address recipient, uint256 amount, uint256 deadline, bytes calldata signature)
        external
    {
        if (paused) revert IsPaused();
        if (block.timestamp > endsAt) revert CampaignEnded();
        _release(claimId, recipient, amount, deadline, signature);
    }

    /// @notice Distribución por lotes: un solo envío para varios reclamos aprobados.
    function releaseBatch(
        bytes32[] calldata claimIds,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256[] calldata deadlines,
        bytes[] calldata signatures
    ) external {
        if (paused) revert IsPaused();
        if (block.timestamp > endsAt) revert CampaignEnded();
        uint256 n = claimIds.length;
        if (recipients.length != n || amounts.length != n || deadlines.length != n || signatures.length != n) {
            revert LengthMismatch();
        }
        for (uint256 i = 0; i < n; i++) {
            _release(claimIds[i], recipients[i], amounts[i], deadlines[i], signatures[i]);
        }
    }

    function _release(bytes32 claimId, address recipient, uint256 amount, uint256 deadline, bytes calldata signature)
        private
    {
        if (block.timestamp > deadline) revert AttestationExpired();
        if (paid[claimId]) revert AlreadyPaid(claimId);
        if (amount > maxPerClaim) revert AmountTooHigh(amount, maxPerClaim);
        if (recipient == address(0)) revert ZeroAddress();
        if (_recover(payoutDigest(claimId, recipient, amount, deadline), signature) != attester) {
            revert InvalidSignature();
        }
        if (balance() < amount) revert InsufficientBalance();

        paid[claimId] = true; // efectos antes de la interacción
        totalReleased += amount;
        _safeTransfer(recipient, amount);
        emit Released(claimId, recipient, amount);
    }

    // ---------------------------------------------------------------- marca

    function setPaused(bool value) external onlyBrand {
        paused = value;
        emit Paused(value);
    }

    /// @notice La marca puede revocar a la plataforma como firmante.
    function setAttester(address next) external onlyBrand {
        if (next == address(0)) revert ZeroAddress();
        emit AttesterChanged(attester, next);
        attester = next;
    }

    /// @notice Devuelve el remanente a la marca, solo al terminar la campaña.
    function refund() external onlyBrand {
        if (block.timestamp <= endsAt) revert CampaignNotEnded();
        uint256 amount = balance();
        _safeTransfer(brand, amount);
        emit Refunded(brand, amount);
    }

    // ---------------------------------------------------------------- EIP-712

    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(this)));
    }

    function payoutDigest(bytes32 claimId, address recipient, uint256 amount, uint256 deadline)
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(abi.encode(PAYOUT_TYPEHASH, claimId, recipient, amount, deadline));
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function _recover(bytes32 digest, bytes calldata sig) private pure returns (address) {
        if (sig.length != 65) revert InvalidSignature();
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        if (uint256(s) > HALF_N) revert InvalidSignature(); // firmas maleables
        if (v != 27 && v != 28) revert InvalidSignature();
        address signer = ecrecover(digest, v, r, s);
        if (signer == address(0)) revert InvalidSignature();
        return signer;
    }

    // ---------------------------------------------------------------- ERC-20 seguro

    function _safeTransfer(address to, uint256 amount) private {
        (bool ok, bytes memory data) = address(token).call(abi.encodeCall(IERC20.transfer, (to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }

    function _safeTransferFrom(address from, address to, uint256 amount) private {
        (bool ok, bytes memory data) =
            address(token).call(abi.encodeCall(IERC20.transferFrom, (from, to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }
}
