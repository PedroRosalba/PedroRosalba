// The catalog. Numbered by release date (repo creation), listed newest first.
// `source` is the file whose line lengths become the card's waveform.
// `blurb` is the long description (featured release), `line` the one-liner (catalog row).
export const projects = [
  {
    cat: 'PR—004',
    year: '2026',
    repo: 'rosalbito',
    title: 'Rosalbito',
    blurb:
      'One command for every engineering task: classifies work by risk, runs an autonomous implement → verify → review loop, and ships a pull request backed by evidence.',
    stack: ['Claude Code', 'Agents', 'Shell'],
    source: 'skill/SKILL.md',
    nowPlaying: true,
  },
  {
    cat: 'PR—003',
    year: '2026',
    repo: 'rust-tx-processor',
    title: 'Rust Transaction Processor',
    line: 'Streaming payment engine — disputes, resolutions, chargebacks.',
    blurb:
      'A CLI payment engine that streams a CSV of transactions and outputs final account balances, including disputes, resolutions and chargebacks.',
    stack: ['Rust', 'CSV streaming', 'Fixed-point arithmetic'],
    source: 'src/engine.rs',
  },
  {
    cat: 'PR—002',
    year: '2026',
    repo: 'basecamp-cavos-stealthaddress-template',
    title: 'Stealth Address Template',
    line: 'Private payments on Starknet through one-time stealth addresses.',
    blurb:
      'A starter app for private payments on Starknet: senders pay to one-time stealth addresses, recipients scan and claim.',
    stack: ['TypeScript', 'Next.js', 'Starknet', 'Cavos'],
    source: 'src/components/sender/SendStealthPaymentTab.tsx',
  },
  {
    cat: 'PR—001',
    year: '2024',
    repo: 'space-invaders-topology',
    title: 'Collaborative Space Invaders',
    line: 'A cooperative multiplayer game on shared CRDT state.',
    blurb:
      'A multiplayer Space Invaders where everyone in a room cooperates to clear the ships, with game state shared over the Topology network.',
    stack: ['TypeScript', 'Next.js', 'Topology CRDTs'],
    source: 'app/topology/index.ts',
  },
];

export const owner = 'PedroRosalba';
export const website = 'https://my-personal-website-gilt-two.vercel.app/';
export const interests = ['Rust', 'Distributed systems', 'AI agents', 'Cryptography', 'Protocols', 'Infrastructure'];
