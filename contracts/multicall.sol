//SPDX-License-Identifier:MIT
pragma solidity ^0.8.25;

contract MULTICALL 
{
    //Bundler function that returns a list of target contracts state data.
    function aggregate (address target, bytes[] calldata calls) 
        public view returns (bytes[] memory bundle) 
    {
        //New array to be returned post modification.
        bundle = new bytes[](calls.length);
        bool success;

        //Loop through a list of functions to call.
        for (uint256 i = 0; i < calls.length; ++i)
        {
            //Read target data and add to bundle array.
            (success, bundle[i]) = target.staticcall(calls[i]);
            require(success, "multicall: staticcall failed");
        }
    }
}