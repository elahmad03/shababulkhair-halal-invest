// lib/abi/tokenAbi.ts
export const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address _owner) view returns (uint256)",
  "function transfer(address _to, uint256 _value) returns (bool)",

  "event Transfer(address indexed from, address indexed to, uint256 value)"
];