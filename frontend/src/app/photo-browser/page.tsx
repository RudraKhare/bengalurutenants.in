import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Browser | BengaluruTenants.in',
  description: 'Browse property photos in Bengaluru',
};

export default function PhotoBrowserPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Property Photos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Photo grid will be implemented here */}
        <p className="text-gray-600">Photo browser coming soon...</p>
      </div>
    </main>
  );
}