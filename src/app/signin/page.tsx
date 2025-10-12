import { redirect } from 'next/navigation';

export default function SigninAlias({ searchParams }: { searchParams: Record<string,string|undefined>; }) {
  const next = searchParams?.next ? `?next=${encodeURIComponent(searchParams.next)}` : '';
  redirect(`/auth/signin${next}`);
}
