export type Runner = {
  id: string;
  name: string;
  avatar: string;
  distance: number; // in kilometers
  runs: number;
};

export const runners: Runner[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    distance: 42.5,
    runs: 12,
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    distance: 38.2,
    runs: 10,
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    distance: 35.7,
    runs: 8,
  },
  {
    id: "4",
    name: "Taylor Swift",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    distance: 30.1,
    runs: 9,
  },
  {
    id: "5",
    name: "Jordan Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    distance: 25.5,
    runs: 7,
  },
]; 