import React, { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, Palette, ShieldCheck, Store, UserRound } from 'lucide-react';
import {
  getDemoCredentials,
  getLocalAccounts,
  hashLocalPassword,
  LocalAccount,
  LocalAuthRole,
  LocalAuthSession,
  saveLocalAccounts,
  seedDemoAccounts,
} from '../auth/localAuth';
import { RedNexusLogo } from '../components/RedNexusLogo';

interface LocalAuthViewProps {
  onAuthenticated: (session: LocalAuthSession) => void;
}

const roles: Array<{ id: LocalAuthRole; label: string; icon: typeof UserRound }> = [
  { id: 'buyer', label: 'Buyer', icon: UserRound },
  { id: 'seller', label: 'Seller', icon: Store },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export const LocalAuthView: React.FC<LocalAuthViewProps> = ({ onAuthenticated }) => {
  const [role, setRole] = useState<LocalAuthRole>('buyer');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const demoCredentials = getDemoCredentials();

  useEffect(() => {
    seedDemoAccounts().catch((seedError: unknown) => {
      setError(seedError instanceof Error ? seedError.message : 'Unable to prepare local demo accounts.');
    });
  }, []);

  const selectRole = (nextRole: LocalAuthRole) => {
    setRole(nextRole);
    setIsRegistering(false);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await seedDemoAccounts();
      const accounts = getLocalAccounts();
      const normalizedEmail = email.trim().toLowerCase();

      if (isRegistering) {
        if (role !== 'buyer') {
          throw new Error('Only buyer accounts can be registered here. Seller and admin accounts must sign in.');
        }
        if (password.length < 8) {
          throw new Error('Choose a password with at least 8 characters.');
        }
        if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
          throw new Error('An account with this email already exists. Sign in instead.');
        }

        const newAccount: LocalAccount = {
          role: 'buyer',
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: await hashLocalPassword(password),
          address: {
            id: 'address-home',
            label: 'Home',
            name: name.trim(),
            line1: addressLine.trim(),
            city: city.trim(),
            phone: phone.trim(),
            isDefault: true,
          },
        };
        saveLocalAccounts([...accounts, newAccount]);
        onAuthenticated({
          role: newAccount.role,
          name: newAccount.name,
          email: newAccount.email,
          address: newAccount.address,
        });
        return;
      }

      const passwordHash = await hashLocalPassword(password);
      const account = accounts.find(
        (candidate) =>
          candidate.role === role &&
          candidate.email.toLowerCase() === normalizedEmail &&
          candidate.passwordHash === passwordHash
      );

      if (!account) {
        throw new Error(`No matching ${role} account was found. Check the role, email, and password.`);
      }

      onAuthenticated({
        role: account.role,
        name: account.name,
        email: account.email,
        address: account.address,
      });
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to complete local sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="flex flex-col justify-between bg-[#8E141A] p-8 text-white sm:p-10">
          <div>
            <RedNexusLogo whiteText size="md" />
            <div className="mt-16 max-w-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Palette className="h-6 w-6" />
              </div>
              <h1 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                Original art. A community of makers.
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Sign in to explore student artwork, manage your orders, or access your authorized work area.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs leading-relaxed text-white/75">
            <div className="flex items-center gap-2 font-bold text-white">
              <LockKeyhole className="h-4 w-4" /> Local prototype accounts
            </div>
            <p className="mt-2">
              Accounts are saved in this browser only. This demonstration is not production authentication and does not protect sensitive data.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Welcome to Red Nexus</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {isRegistering ? 'Create your buyer account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Choose your account type to continue to its sign-in page.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-neutral-100 p-1.5" role="group" aria-label="Account type">
              {roles.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectRole(id)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold transition-colors ${
                    role === id
                      ? 'bg-white text-red-700 shadow-sm'
                      : 'text-neutral-600 hover:text-slate-900'
                  }`}
                  aria-pressed={role === id}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isRegistering && (
                <>
                  <label className="block text-sm font-semibold text-slate-700">
                    Full name
                    <input
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      placeholder="Your name"
                    />
                  </label>
                  <fieldset className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                    <legend className="px-1 text-sm font-bold text-slate-800">Saved delivery address</legend>
                    <label className="block text-sm font-semibold text-slate-700">
                      Phone number
                      <input
                        required
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        placeholder="+63"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Address
                      <input
                        required
                        autoComplete="street-address"
                        value={addressLine}
                        onChange={(event) => setAddressLine(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        placeholder="House/unit, street, barangay"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      City, province, and postal code
                      <input
                        required
                        autoComplete="address-level2"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        placeholder="Quezon City, Metro Manila 1101"
                      />
                    </label>
                  </fieldset>
                </>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  required
                  type="password"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  minLength={isRegistering ? 8 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
                />
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E52535] px-5 py-3.5 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? 'Please wait…' : isRegistering ? 'Create buyer account' : `Sign in as ${role}`}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {role === 'buyer' && (
              <p className="mt-5 text-center text-sm text-neutral-600">
                {isRegistering ? 'Already registered?' : 'New to Red Nexus?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering((current) => !current);
                    setError('');
                  }}
                  className="font-bold text-red-700 hover:text-red-800"
                >
                  {isRegistering ? 'Sign in' : 'Create a buyer account'}
                </button>
              </p>
            )}

            {role !== 'buyer' && (
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Local demo {role} credentials</p>
                {demoCredentials.filter((credential) => credential.role === role).map((credential) => (
                  <div key={credential.email} className="mt-3 space-y-1 text-xs text-neutral-600">
                    <p>Email: <code className="font-semibold text-slate-900">{credential.email}</code></p>
                    <p>Password: <code className="font-semibold text-slate-900">{credential.password}</code></p>
                  </div>
                ))}
              </div>
            )}

            {role === 'buyer' && isRegistering && (
              <p className="mt-4 text-center text-xs text-neutral-400">
                Your buyer account and saved address are stored locally on this device.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
