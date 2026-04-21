//SPDX-License-Identifier:MIT
pragma solidity ^0.8.29;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

contract EUROPA is 
    UUPSUpgradeable, 
    ERC721AUpgradeable, 
    OwnableUpgradeable, 
    ERC2981Upgradeable, 
    ReentrancyGuardUpgradeable 
{
    //Events to be fired when the contract state changes.
    event UpdatedTotalSupply (uint256 value);
    event UpdatedMaxSupply (uint256 value);
    event WhitelistPhase (bool toogle);
    event PublicPhase (bool toogle);
    event TokenTransfers (bool toggle);

    //Smart contract state variables.
    bool public tradingState;
    bool public whitelistMintState;
    bool public publicMintState;
    uint256 public maxSupply;
    uint256 public whitelistMintLimit;
    uint256 public publicMintLimit;
    uint256 public whitelistMintPrice;
    uint256 public publicMintPrice;
    bytes32 public merkleRoot;
    string public baseTokenURI;

    //Contract state to be passed during deployment.
    struct MetaData
    {
        bool newTradingState;
        bool newWhitelistMintState;
        bool newPublicMintState;
        uint256 newMaxSupply;
        uint256 newWhitelistMintLimit;
        uint256 newPublicMintLimit;
        uint256 newWhitelistMintPrice;
        uint256 newPublicMintPrice;
        bytes32 newMerkleRoot;
        string newBaseURI;
        address newRoyaltyReceiver;
        uint96 newRoyaltyBasisPoints;
    }

    //Denies initialization of this implementation contract. 
    constructor ()
    {
        _disableInitializers ();
    }

    //Initializer function that should only be called by the proxy contract.
    function initialize (MetaData memory config) public initializerERC721A initializer 
    {
        __ERC721A_init ("EUROPA", "ERP");
        __Ownable_init (msg.sender);
        __ERC2981_init ();
        __ReentrancyGuard_init ();
        __UUPSUpgradeable_init ();

        //Initialize the state of the contract with the values given during deployment.
        setTradingState (config.newTradingState);
        setWhitelistMintState (config.newWhitelistMintState);
        setPublicMintState (config.newPublicMintState);
        setMaxSupply (config.newMaxSupply);
        setWhitelistMintLimit (config.newWhitelistMintLimit);
        setPublicMintLimit (config.newPublicMintLimit);
        setWhitelistMintPrice (config.newWhitelistMintPrice);
        setPublicMintPrice (config.newPublicMintPrice);
        setMerkleRoot (config.newMerkleRoot);
        setBaseURI (config.newBaseURI);
        setRoyaltyInfo (config.newRoyaltyReceiver, config.newRoyaltyBasisPoints);
    }

    //Modifier that facilitates the whitelist mint phase with various conditions.
    modifier whitelistMintCompliance (uint256 quantity, bytes32[] calldata merkleProof) 
    {
        //Makes the first token minted free for each whitelisted user only.
        uint256 effectiveQuantity = balanceOf (msg.sender) > 0 ? quantity : quantity - 1;

        //Makes sure that the total minted amount does not exceed project supply.
        require 
        ( 
            totalSupply() + quantity <= maxSupply, 
            "Attempted mint amount exceeds max supply!" 
        );

        //Makes sure that the whitelist mint phase is on or off.
        require 
        ( 
            whitelistMintState, 
            "Whitelist mint phase is currently off!"
        );

        //Makes sure that the user attempting to mint is whitelisted.
        require 
        (
            whitelistStatus (merkleProof),
            "You are not whitelisted!"
        );

        //Makes sure that the user does not exceed maximum whitelist mint limit.
        require 
        ( 
            quantity + balanceOf (msg.sender) <= whitelistMintLimit, 
            "Can't mint more than whitelist mint limit!" 
        );

        //Makes sure that the user sends the right amount of funds to mint.
        require 
        ( 
            msg.value >= whitelistMintPrice * effectiveQuantity, 
            "Insufficient funds!"
        );        
        _;
    }

    //Modifier that facilitates the public mint phase with various conditions.
    modifier publicMintCompliance (uint256 quantity) 
    {
        //Makes sure that the total minted amount does not exceed project supply.
        require 
        ( 
            totalSupply() + quantity <= maxSupply, 
            "Attempted mint amount exceeds max supply!" 
        );

        //Makes sure that the public mint phase is on or off.
        require 
        ( 
            publicMintState, 
            "Public mint phase is currently off!" 
        );

        //Makes sure that the user does not exceed maximum public mint limit.
        require 
        ( 
            quantity + balanceOf (msg.sender) <= publicMintLimit, 
            "Can't mint more than public mint limit!" 
        );

        //Makes sure that the user does not exceed maximum public mint limit.
        require 
        ( 
            msg.value >= publicMintPrice * quantity,
            "Insufficient funds!" 
        );
        _;
    }

    //Override the array to start at 1 for the token counter.
    function _startTokenId () 
        internal view virtual override (ERC721AUpgradeable) returns (uint256) 
    {
        return 1;
    }

    //Override the required base uri function to accurately return new uri.
    function _baseURI () 
        internal view virtual override (ERC721AUpgradeable) returns (string memory)
    {
        return baseTokenURI;
    }

    function _authorizeUpgrade (address newImplementation) internal override onlyOwner
    {
        //The body of this function remains empty as it's only a required override.
    }

    //Override the internal _beforeTokenTransfers function to enfore transfer lock.
    function _beforeTokenTransfers 
    ( 
        address from, address to, uint256 startTokenId, uint256 quantity 
    ) internal override 
    {
        if (from == address(0)) return;
        require (tradingState, "Trading is disabled until end of mint phase!");
        super._beforeTokenTransfers (from, to, startTokenId, quantity);
    }

    //Override required function to signal that this contract sets royalties internally.
    function supportsInterface (bytes4 interfaceId) 
        public view virtual override (ERC721AUpgradeable, ERC2981Upgradeable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    //Uses merkle proofing to validate the whitelist minting procedure.
    function whitelistStatus (bytes32[] calldata merkleProof) public view returns (bool)
    {
        bytes32 merkleLeaf = keccak256 (abi.encodePacked(msg.sender));
        return MerkleProof.verify (merkleProof, merkleRoot, merkleLeaf);
    }

    //Sets the amount of royalties that the creator gets from paid transactions.
    function setRoyaltyInfo (address receiver, uint96 basisPoints) public onlyOwner
    {
        _setDefaultRoyalty(receiver, basisPoints);
    }

    //The reveal function for switching the cover images to the actual nfts.
    function setBaseURI (string memory newBaseURI) public onlyOwner 
    {
        baseTokenURI = newBaseURI;
    }

    //Sets the merkle root for the merkle validation logic.
    function setMerkleRoot (bytes32 newMerkleRoot) public onlyOwner
    {
        merkleRoot = newMerkleRoot;
    }

    //This function can be used to allow token transfer after minting.
    function setTradingState (bool newTradingState) public onlyOwner 
    {
        tradingState = newTradingState;
        emit TokenTransfers (newTradingState);
    }

    //Sets the maximum project supply, can be used to cut supply just in case.
    function setMaxSupply (uint256 newMaxSupply) public onlyOwner
    {
        maxSupply = newMaxSupply;
        emit UpdatedMaxSupply (newMaxSupply);
    }

    //Sets the maximum allowed whitelist mint limit per user.
    function setWhitelistMintLimit (uint256 newWhitelistLimit) public onlyOwner
    {
        whitelistMintLimit = newWhitelistLimit;
    }

    //Sets the whitelist minting phase to be on or off.
    function setWhitelistMintState (bool newWhitelistMintState) public onlyOwner
    {
        whitelistMintState = newWhitelistMintState;
        emit WhitelistPhase (newWhitelistMintState);
    }

    //Sets the price to be charged per nft during the whitelist mint phase.
    function setWhitelistMintPrice (uint256 newWhitelistMintPrice) public onlyOwner 
    {
        whitelistMintPrice = newWhitelistMintPrice;
    }

    //Sets the public mint limit per user during the public mint phase.
    function setPublicMintLimit (uint256 newPublicMintLimit) public onlyOwner
    {
        publicMintLimit = newPublicMintLimit;
    }

    //Sets the public mint phase to be on or off.
    function setPublicMintState (bool newPublicMintState) public onlyOwner 
    {
        publicMintState = newPublicMintState;
        emit PublicPhase (newPublicMintState);
    }

    //Sets the price to be charged per nft during the public mint phase.
    function setPublicMintPrice (uint256 newPublicMintPrice) public onlyOwner
    {
        publicMintPrice = newPublicMintPrice;
    }

    //Bundler function that returns a list of target contracts state data.
    //Used to bundle total requests made to the contract to reduce traffic load.
    function aggregate (bytes[] calldata calls) public view returns (bytes[] memory bundle) 
    {
        //New array to be returned post modification.
        bundle = new bytes[](calls.length);
        bool success;

        //Loop through a list of functions to call.
        for (uint256 i = 0; i < calls.length; ++i)
        {
            //Read target data and add to bundle array.
            (success, bundle[i]) = address(this).staticcall(calls[i]);
            require(success, "multicall: staticcall failed");
        }
    }

    //Mints new tokens from the contract to the provided list of wallet addresses.
    //The transfer occurs in bulk and sends a set amount of tokens to each user in the list.
    function airdrop (address[] calldata recipients, uint256 quantity) external onlyOwner
    {
        require (quantity * recipients.length < maxSupply, "Can't mint over max supply!");
        for (uint256 i = 0; i < recipients.length; i++)
        {
            require (recipients[i] != address(0), "Can not send to the null address!");
            _mint (recipients[i], quantity);
        }
        emit UpdatedTotalSupply (totalSupply());
    }

    //Minting function to be called during the whitelist mint phase.
    //Integrates the whitelistMintCompliance modifier to facilitate whitelist minting.
    function whitelistMint (uint256 quantity, bytes32[] calldata merkleProof) 
        whitelistMintCompliance (quantity, merkleProof) external payable 
    {
        _mint (msg.sender, quantity);
        emit UpdatedTotalSupply (totalSupply());
    }

    //Minting function to be called during the public mint phase. 
    //Integrates the publicMintCompliance modifier to facilitate public minting.
    function publicMint (uint256 quantity) publicMintCompliance (quantity) external payable 
    {
        _mint (msg.sender, quantity);
        emit UpdatedTotalSupply (totalSupply());
    }

    //Mint function to be called prior to either mint phases. 
    //Meant to reserve some tokens for future giveaways/drops etc.
    function teamMint (uint256 quantity) external onlyOwner  
    {
        _mint (msg.sender, quantity);
        emit UpdatedTotalSupply (totalSupply());
    }

    //Mint function to be called if max supply is not reached. 
    //Meant to reserve the remaining tokens to the team wallet. 
    function finalMint () external onlyOwner 
    {
        _mint (msg.sender, maxSupply - totalSupply());
        emit UpdatedTotalSupply (totalSupply());
    }

    //Function to be called by the owner to withdraw the funds from the contract.
    function withdraw () external onlyOwner nonReentrant 
    {
        (bool success,) = owner().call{value: address(this).balance}("");
        require (success, "Withdrawal failed!"); 
    }
}