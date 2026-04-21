# Apex Protocol: Upgradeable State & Asset Architecture

## Overview
Apex Protocol is a full-stack, decentralized application developed as a technical sandbox to master complex state management, proxy/logic contract upgradeability, and secure user validation methodologies on a public ledger. 

While the frontend application interfaces with digital assets (ERC-721), the core focus of this repository is rigorous backend engineering, optimizing gas execution, securing financial state transitions, and building a flexible, upgradeable architecture from the ground up without relying on abstracted "black-box" frameworks.

## System Architecture

### Smart Contract Engineering
* **UUPS Proxy Pattern (EIP-1967):** The protocol separates storage (Proxy) from execution (Logic) using the Universal Upgradeable Proxy Standard. This allows the core logic to be patched or upgraded without abandoning the deployed state or requiring user migration.
* **Traffic & Execution Optimization:** Integrates the `ERC721A` standard to process batch transactions at a fraction of standard computational costs. Additionally implements a custom `Multicall` (aggregate) bundler to batch state-read requests, minimizing RPC endpoint load.
* **Cryptographic Allowlisting:** Instead of storing large, gas-heavy arrays of permitted addresses on-chain, access control is handled off-chain and verified on-chain via strictly enforced **Merkle Root proofs**.
* **State-Driven Transfer Locks:** Overrides standard transfer protocols to enforce strict, owner-controlled trading phases, preventing asset movement until explicit protocol state conditions are met.

### Client-Side Data & UI Optimization
* **Serverless Merkle Generation:** Designed a standalone frontend architecture utilizing browser-side Keccak256 hashing to dynamically generate Merkle proofs, facilitating secure access control without relying on a centralized backend database.
* **Event-Driven State Management:** Implements real-time React state synchronization by subscribing directly to WebSockets and smart contract event emitters, entirely eliminating the need for inefficient data polling.
* **Dual-Wallet Account Abstraction:** Features a custom provider connection interface supporting both standard injected Web3 wallets (e.g., MetaMask) and advanced Smart Contract Wallets (Abstract Global Wallet/ERC-4337) to handle complex, sponsored transaction routing.

## Tech Stack
* **Smart Contracts:** Solidity, OpenZeppelin (Upgradeable Suite), Merkle Proof Cryptography
* **Frontend:** React, Next.js, SCSS
* **Web3 Integration:** Ethers.js, Viem, Abstract Global Wallet (AGW), Alchemy WebSocket Infrastructure