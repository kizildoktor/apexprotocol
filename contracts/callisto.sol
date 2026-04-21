//SPDX-License-Identifier:MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract CALLISTO is ERC1967Proxy
{
    constructor (address _logic, bytes memory _data) ERC1967Proxy (_logic, _data)
    {
        //Constructor remains empty as this is only a proxy instance.
    }
}