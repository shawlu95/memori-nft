//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
pragma experimental ABIEncoderV2;

import "@opengsn/contracts/src/BasePaymaster.sol";

contract MemoriPaymaster is BasePaymaster {
    bool public useSenderWhitelist;
    bool public useTargetWhitelist;
    mapping(address => bool) public senderWhitelist;
    mapping(address => bool) public targetWhitelist;

    function whitelistSender(address sender) public onlyOwner {
        senderWhitelist[sender] = true;
        useSenderWhitelist = true;
    }

    function whitelistTarget(address target) public onlyOwner {
        targetWhitelist[target] = true;
        useTargetWhitelist = true;
    }

    function versionPaymaster()
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "2.2.0+opengsn.whitelist.ipaymaster";
    }

    function preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    )
        external
        virtual
        override
        returns (bytes memory context, bool revertOnRecipientRevert)
    {
        (relayRequest, signature, approvalData, maxPossibleGas);
        if (useSenderWhitelist) {
            require(senderWhitelist[relayRequest.request.from], "Bad sender");
        }
        if (useTargetWhitelist) {
            require(targetWhitelist[relayRequest.request.to], "Bad target");
        }
        return ("", false);
    }

    function postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) external virtual override {
        (context, success, gasUseWithoutPost, relayData);
    }
}
