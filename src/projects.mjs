// Selected work, numbered and ordered as on the website; newer projects append.
export const projects = [
  {
    repo: 'rust-tx-processor',
    title: 'Rust Transaction Processor',
    blurb:
      'A CLI payment engine that streams a CSV of transactions and outputs final account balances, including disputes, resolutions and chargebacks.',
    stack: ['Rust', 'CSV streaming', 'Fixed-point arithmetic'],
  },
  {
    repo: 'basecamp-cavos-stealthaddress-template',
    title: 'Stealth Address Template',
    blurb:
      'A starter app for private payments on Starknet: senders pay to one-time stealth addresses, recipients scan and claim.',
    stack: ['TypeScript', 'Next.js', 'Starknet', 'Cavos'],
  },
  {
    repo: 'space-invaders-topology',
    title: 'Collaborative Space Invaders',
    blurb:
      'A multiplayer Space Invaders where everyone in a room cooperates to clear the ships, with game state shared over the Topology network.',
    stack: ['TypeScript', 'Next.js', 'Topology (CRDT objects)'],
  },
  {
    repo: 'rosalbito',
    title: 'Rosalbito',
    blurb:
      'One command for every engineering task: classifies work by risk, runs an autonomous implement → verify → review loop, and ships a pull request backed by evidence.',
    stack: ['Claude Code', 'AI agents', 'Shell'],
  },
];

export const owner = 'PedroRosalba';
export const website = 'https://my-personal-website-gilt-two.vercel.app/';
export const interests = ['Rust', 'Distributed systems', 'AI agents', 'Cryptography', 'Protocols', 'Infrastructure'];
