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
  addresses?: LocalBuyerAddress[];
  createdAt?: string;
}

export interface LocalAccount extends LocalAuthSession {
  passwordHash: string;
  createdAt?: string;
  sellerStatus?: 'Verified' | 'Pending' | 'Rejected';
  isBanned?: boolean;
  isSuspended?: boolean;
  strikeCount?: number;
}

const ACCOUNTS_KEY = 'red-nexus-local-accounts';
const REMOVED_ACCOUNTS_KEY = 'red-nexus-removed-accounts';

const isLocalBuyerAddress = (value: unknown): value is LocalBuyerAddress => (
  typeof value === 'object' &&
  value !== null &&
  'id' in value && typeof value.id === 'string' &&
  'label' in value && typeof value.label === 'string' &&
  'name' in value && typeof value.name === 'string' &&
  'line1' in value && typeof value.line1 === 'string' &&
  'city' in value && typeof value.city === 'string' &&
  'phone' in value && typeof value.phone === 'string' &&
  'isDefault' in value && typeof value.isDefault === 'boolean'
);

const demoAccounts: Array<LocalAccount & { password: string }> = [
  {
    role: 'buyer',
    name: 'Ana Reyes',
    email: 'customer@rednexus.local',
    password: 'CustomerDemo123!',
    passwordHash: '',
    address: {
      id: 'address-home',
      label: 'Home',
      name: 'Ana Reyes',
      line1: 'Unit 402, J. P. Rizal St., Brgy. Diliman',
      city: 'Quezon City, Metro Manila 1101',
      phone: '+63 917 842 4821',
      isDefault: true,
    },
  },
  {
    role: 'seller',
    name: 'Malia Santos',
    email: 'seller@rednexus.local',
    password: 'SellerDemo123!',
    passwordHash: '',
    sellerStatus: 'Verified',
    isBanned: false,
    strikeCount: 0,
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
    typeof account.passwordHash === 'string' &&
    (!('createdAt' in account) || account.createdAt === undefined || typeof account.createdAt === 'string') &&
    (!('address' in account) || account.address === undefined || isLocalBuyerAddress(account.address)) &&
    (!('addresses' in account) || account.addresses === undefined ||
      (Array.isArray(account.addresses) && account.addresses.every(isLocalBuyerAddress)))
  ));
};

export const saveLocalAccounts = (accounts: LocalAccount[]) => {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  const activeEmails = new Set(accounts.map((account) => account.email.toLowerCase()));
  const removedEmails = getRemovedAccountEmails().filter((email) => !activeEmails.has(email));
  window.localStorage.setItem(REMOVED_ACCOUNTS_KEY, JSON.stringify(removedEmails));
};

const getRemovedAccountEmails = (): string[] => {
  const savedEmails = window.localStorage.getItem(REMOVED_ACCOUNTS_KEY);
  if (!savedEmails) return [];
  const parsedEmails: unknown = JSON.parse(savedEmails);
  if (!Array.isArray(parsedEmails) || !parsedEmails.every((email) => typeof email === 'string')) {
    throw new Error('Saved removed-account data is unreadable. Clear this site’s local storage and try again.');
  }
  return parsedEmails.map((email) => email.toLowerCase());
};

export const removeLocalAccount = (email: string, role: 'buyer' | 'seller'): boolean => {
  const normalizedEmail = email.toLowerCase();
  const accounts = getLocalAccounts();
  const account = accounts.find((candidate) => (
    candidate.email.toLowerCase() === normalizedEmail && candidate.role === role
  ));
  if (!account) return false;

  const removedEmails = getRemovedAccountEmails();
  const nextRemovedEmails = removedEmails.includes(normalizedEmail)
    ? removedEmails
    : [...removedEmails, normalizedEmail];
  const remainingAccounts = accounts.filter((candidate) => candidate !== account);
  window.localStorage.setItem(REMOVED_ACCOUNTS_KEY, JSON.stringify(nextRemovedEmails));
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remainingAccounts));
  } catch (error) {
    window.localStorage.setItem(REMOVED_ACCOUNTS_KEY, JSON.stringify(removedEmails));
    throw error;
  }
  return true;
};

export const getLocalAccountByEmail = (email: string): LocalAccount | undefined => (
  getLocalAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase())
);

export const updateLocalAccountAccess = (
  email: string,
  updates: Pick<LocalAccount, 'sellerStatus' | 'isBanned' | 'isSuspended' | 'strikeCount'>
): boolean => {
  const accounts = getLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );
  if (accountIndex < 0) return false;

  accounts[accountIndex] = { ...accounts[accountIndex], ...updates };
  saveLocalAccounts(accounts);
  return true;
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

export const updateLocalBuyerAddresses = (email: string, addresses: LocalBuyerAddress[]) => {
  const accounts = getLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.role === 'buyer' && account.email.toLowerCase() === email.toLowerCase()
  );
  if (accountIndex < 0) throw new Error('The signed-in buyer account could not be found in local storage.');
  if (addresses.length === 0 || addresses.filter((address) => address.isDefault).length !== 1) {
    throw new Error('Save at least one address and choose exactly one default address.');
  }

  const defaultAddress = addresses.find((address) => address.isDefault);
  if (!defaultAddress) throw new Error('Choose a default delivery address.');
  accounts[accountIndex] = { ...accounts[accountIndex], address: defaultAddress, addresses };
  saveLocalAccounts(accounts);
};

export const updateLocalBuyerProfile = (email: string, name: string) => {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('Enter a display name.');

  const accounts = getLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.role === 'buyer' && account.email.toLowerCase() === email.toLowerCase()
  );
  if (accountIndex < 0) throw new Error('The signed-in buyer account could not be found in local storage.');

  accounts[accountIndex] = { ...accounts[accountIndex], name: normalizedName };
  saveLocalAccounts(accounts);
};

export const changeLocalBuyerPassword = async (
  email: string,
  currentPassword: string,
  newPassword: string
) => {
  if (newPassword.length < 8) throw new Error('Choose a password with at least 8 characters.');

  const accounts = getLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.role === 'buyer' && account.email.toLowerCase() === email.toLowerCase()
  );
  if (accountIndex < 0) throw new Error('The signed-in buyer account could not be found in local storage.');

  const currentPasswordHash = await hashLocalPassword(currentPassword);
  if (accounts[accountIndex].passwordHash !== currentPasswordHash) {
    throw new Error('The current password is incorrect.');
  }
  if (currentPasswordHash === await hashLocalPassword(newPassword)) {
    throw new Error('Choose a new password that is different from your current password.');
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    passwordHash: await hashLocalPassword(newPassword),
  };
  saveLocalAccounts(accounts);
};

export const seedDemoAccounts = async () => {
  const accounts = getLocalAccounts();
  let changed = false;
  const removedEmails = new Set(getRemovedAccountEmails());

  for (const demoAccount of demoAccounts) {
    if (removedEmails.has(demoAccount.email.toLowerCase())) continue;
    const accountAlreadyExists = demoAccount.role === 'buyer'
      ? accounts.some((account) => account.email.toLowerCase() === demoAccount.email.toLowerCase())
      : accounts.some((account) => account.role === demoAccount.role);
    if (accountAlreadyExists) continue;
    accounts.push({
      role: demoAccount.role,
      name: demoAccount.name,
      email: demoAccount.email,
      passwordHash: await hashLocalPassword(demoAccount.password),
      createdAt: new Date().toISOString(),
      ...(demoAccount.address ? { address: demoAccount.address } : {}),
      ...(demoAccount.address ? { addresses: [demoAccount.address] } : {}),
      ...(demoAccount.role === 'seller'
        ? { sellerStatus: demoAccount.sellerStatus, isBanned: false, strikeCount: 0 }
        : {}),
    });
    changed = true;
  }

  for (const account of accounts) {
    if (!account.createdAt) {
      account.createdAt = new Date().toISOString();
      changed = true;
    }
    if (account.role === 'buyer' && !account.addresses && account.address) {
      account.addresses = [account.address];
      changed = true;
    }
  }

  const demoSeller = accounts.find((account) => (
    account.role === 'seller' &&
    account.email.toLowerCase() === 'seller@rednexus.local'
  ));
  if (demoSeller) {
    if (demoSeller.sellerStatus === undefined) {
      demoSeller.sellerStatus = 'Verified';
      changed = true;
    }
    if (demoSeller.isBanned === undefined) {
      demoSeller.isBanned = false;
      changed = true;
    }
    if (demoSeller.strikeCount === undefined) {
      demoSeller.strikeCount = 0;
      changed = true;
    }
  }

  if (changed) saveLocalAccounts(accounts);
};

export const getDemoCredentials = () => demoAccounts.map(({ role, email, password }) => ({
  role,
  email,
  password,
}));
