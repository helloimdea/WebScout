import ProxyForm from '../ProxyForm';

export default function ProxyFormExample() {
  const handleSubmit = (url: string) => {
    console.log('Proxy form submitted with URL:', url);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default State</h3>
        <ProxyForm onSubmit={handleSubmit} isLoading={false} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading State</h3>
        <ProxyForm onSubmit={handleSubmit} isLoading={true} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Error State</h3>
        <ProxyForm 
          onSubmit={handleSubmit} 
          isLoading={false} 
          error="Failed to load the website. Please check the URL and try again."
        />
      </div>
    </div>
  );
}