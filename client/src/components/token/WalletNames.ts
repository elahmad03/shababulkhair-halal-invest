// src/components/token/WalletNames.ts

const rawWalletNames: Record<string, string> = {
  '0x5e1c7a84fec900ed0d8e9ce8304a53f9fa4c1e9d': 'levihouesinon CEC idm',
  '0x9948c0d4b2f8eed11215986a0d8884656ea7bf76': 'Ahmad C.E.O Bzst',
  '0xd49e5fc5994f9b55294c0b60118f5bc2f73fd507': 'Asrar Ahmad CTO',
  '0xbf8b0db07763b411d9c62ff210b914da097cc9f6': 'Marie theressa Ui/UX',
  '0x1563C74Bf9067B5dB37B0Fb5119C94AfA1310aF8': 'hapsat isa marketing manager',
  '0x561f168b786425b89ee9d431cdd12ff8fd98668e': 'ghait Alo (lead dev)',
  '0xe95f4776ac2abe1c4989d856616226152482d170': 'Alhassan zorome',
  '0x111F66203e27FF6bEE8dBaaAE5D7a133Bb5fd292': 'Fatima adamu jahjah data analyst',
  '0x43f21A10960a8B2845bCD5d89815C9f824517e2e': 'Anas magaji techinical support specialist',
  '0x7B94931072B5Aa2C61e957430489b7d177857B61': 'Usman mohammed kurama Ui/Ux',
  '0xd50f806eb63e2cb6Cfe838C42dCF2040158153C4': 'David Gackpo Customer support team',
  '0x7336B4d5ea12cf23DA4a34e89F65F650eC64Bb3a': 'Francois Boko Customer Support Team',
  '0x805A7995AC8e41BAa35184678F327c555045a261': 'Aliyu Abubakar Data analyst',
  '0xf243024DFDD1ec0f65df3144FdcA858813440fB2': 'Amina Usman Quality assurance',
  '0xD8727c462108c24f1991006BFf1daf90C692c0F3': 'Uwani Mohammad UI/ux',
  '0xB60Cb8D9820099C9dCE1aFAF815D04a79b2fB516':'Comriya',
  '0xDfc287f87DD37BA088cC07C4f8A80925484FDc0b': 'Salamatu ibrahim Business Analyst',
  '0x6F51c3BdaB51eD9B3E6373B4A38E4ae62A27A65A': 'Qaribullahi Kabiru Technical Support specialist',
  '0xD1be27C9C13719A9eF38e3aa3C508470ae7eB66E': 'Isah Abubakar Quality Assurance Specialist',
  '0x2E13388bC14D85D4bf2c7118Bb46944C8172f964': 'Shehu Maikyau Lead developer',
  '0x8de1DA0107D579850745F7ca03975eFB6fc8E273': 'Mohammad Promise Data analyst',
  '0xB3a5E4FC5102A18fD24d719c6aC79952Aac71B3B': 'Yusuf Gambo CTO',
  '0xe95f4776Ac2ABE1c4989D856616226152482D170': 'Alhassan zorome Project manager',
  '0x1E42405b0298220F679c905c7Ef0a5db1a8a3D15': 'Abubakar mohammed Customer Support Lead',
  '0x32A671aC0364Db4E2cD3762Bc411778b25DA76fd': 'Aminu mohammed CTO',
  '0x99d121fcc1A75a740e79F2753C58Ea4080fDa7D4': 'Ali Adamu Musa Marketting manager',
  '0xcb1F7C5FB892e1160B22855c0c239EEBac19FcD9': 'Abdulhamid Yakubu Comminity Manager',
  '0xc858217Aa36d075dB6d09ce70692D2fBa11B8867': 'umar abdullahi Customer Support',
  '0x169c3A637c743962Def7968A0c00587120533187': 'Dahiru ibrahim customer support',
  '0x4eD7154B6550702cDC3FcDEA82eAd34081dc2F85': 'Abduljalil Sani Customer specialist',
  '0x8117e0FDd8c3E833C697036AD49B9842C18B78c3': 'Alasan Idris CTO',
  '0x874a365A86bb53960937C47586Fa2F6eDDDA8e33': 'Alamin tijjani Data analyst',
  '0x56b41a7F9916A3DDC1290bC572793cADD362E8c0':'umar mohammad hamman Ui/ux',
  '0x3c628b76c718ecc056dbbe2a884075b7334cb9ca': 'joshua emmanuel',
  '0xf5e867bfc53e553b928343644b5d7099c6ea66ac': 'wxiantai',
  '0x7A12382Ca9410ee3050590556FAc8416654aA195': 'liquidity pool Sda',
  '0x4bd3efCd0b2D7C365f2ADfF27EF5df72fbc08087': 'Liquidity route noor alhaqq'

};

// Normalize keys to lowercase so lookups are case-insensitive.
export const walletNames: Record<string, string> = Object.fromEntries(
  Object.entries(rawWalletNames).map(([k, v]) => [k.toLowerCase(), v])
);

export const walletAddresses = Object.keys(walletNames);

export function getWalletName(address: string) {
  return walletNames[address.toLowerCase()] || address;
}