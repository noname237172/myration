export interface FamilyMember {
  name: string;
  age: number;
  relation: string;
  photo: string;
}

export interface Family {
  rationId: string;
  password: string;
  headOfFamily: string;
  address: string;
  cardType: string;
  members: FamilyMember[];
}

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;

export const families: Family[] = [
  {
    rationId: "RAT-2024-001",
    password: "1234",
    headOfFamily: "Ramesh Kumar",
    address: "42, Gandhi Nagar, Ward 7, New Delhi - 110001",
    cardType: "BPL (Yellow)",
    members: [
      { name: "Ramesh Kumar", age: 48, relation: "Self", photo: avatarUrl("ramesh") },
      { name: "Sunita Devi", age: 44, relation: "Wife", photo: avatarUrl("sunita") },
      { name: "Amit Kumar", age: 22, relation: "Son", photo: avatarUrl("amit") },
      { name: "Priya Kumar", age: 18, relation: "Daughter", photo: avatarUrl("priya") },
    ],
  },
  {
    rationId: "RAT-2024-002",
    password: "5678",
    headOfFamily: "Suresh Patel",
    address: "15, Nehru Colony, Sector 5, Mumbai - 400001",
    cardType: "APL (Orange)",
    members: [
      { name: "Suresh Patel", age: 55, relation: "Self", photo: avatarUrl("suresh") },
      { name: "Meena Patel", age: 50, relation: "Wife", photo: avatarUrl("meena") },
      { name: "Raj Patel", age: 28, relation: "Son", photo: avatarUrl("raj") },
    ],
  },
];
