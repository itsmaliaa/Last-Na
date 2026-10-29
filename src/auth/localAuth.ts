export type LocalAuthRole = 'buyer' | 'seller' | 'admin';

export interface LocalBuyerAddress {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export interface LocalAuthSession {
  role: LocalAuthRole;
  name: string;
  email: string;
  address?: LocalBuyerAddress;
}

export interface LocalAccount extends LocalAuthSession {
  passwordHash: string;
}

const ACCOUNTS_KEY = 'red-nexus-local-accounts';

const demoAccounts: Array<LocalAccount & { password: string }> = [
  {
    role: 'seller',
    name: 'Malia Santos',
    email: 'seller@rednexus.local',
    password: 'SellerDemo123!',
    passwordHash: '',
  },
  {
    role: 'admin',
    name: 'Malia J.',
    email: 'admin@rednexus.local',
    password: 'AdminDemo123!',
    passwordHash: '',
  },
];

export const hashLocalPassword = async (password: string): Promise<string> => {
  const bytes = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const getLocalAccounts = (): LocalAccount[] => {
  const storedAccounts = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!storedAccounts) return [];

  const parsedAccounts: unknown = JSON.parse(storedAccounts);
  if (!Array.isArray(parsedAccounts)) {
    throw new Error('Saved local accounts are unreadable. Clear this site’s local storage and try again.');
  }

  return parsedAccounts.filter((account): account is LocalAccount => (
    typeof account === 'object' &&
    account !== null &&
    'role' in account &&
    (account.role === 'buyer' || account.role === 'seller' || account.role === 'admin') &&
    'name' in account &&
    typeof account.name === 'string' &&
    'email' in account &&
    typeof account.email === 'string' &&
    'passwordHash' in account &&
    typeof account.passwordHash === 'string'
  ));
};

export const saveLocalAccounts = (accounts: LocalAccount[]) => {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const updateLocalBuyerAddress = (email: string, address: LocalBuyerAddress) => {
  const accounts = getLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.role === 'buyer' && account.email.toLowerCase() === email.toLowerCase()
  );
  if (accountIndex < 0) throw new Error('The signed-in buyer account could not be found in local storage.');

  accounts[accountIndex] = { ...accounts[accountIndex], address };
  saveLocalAccounts(accounts);
};

export const seedDemoAccounts = async () => {
  const accounts = getLocalAccounts();
  let changed = false;

  for (const demoAccount of demoAccounts) {
    if (accounts.some((account) => account.role === demoAccount.role)) continue;
    accounts.push({
      role: demoAccount.role,
      name: demoAccount.name,
      email: demoAccount.email,
      passwordHash: await hashLocalPassword(demoAccount.password),
    });
    changed = true;
  }

  if (changed) saveLocalAccounts(accounts);
};

export const getDemoCredentials = () => demoAccounts.map(({ role, email, password }) => ({
  role,
  email,
  password,
}));
