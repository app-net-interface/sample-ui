import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import VPCConnectionGraph from './VPCConnectionGraph';
import { InfraResourceProvider } from '@/common/enum';
import {
  useFetchVpcsResources,
  useFetchVpcAccounts,
  useFetchRegions
} from '@/common/hooks';

interface VpcIdentity {
  provider: InfraResourceProvider;
  accountId: string;
  region: string;
  vpcId: string;
}

interface Account {
  accountId: string;
  name?: string;
}

interface Region {
  region: string;
  name?: string;
}

type VpcFromHook = {
  id: string;
  name?: string;
};

const VPCConnectionPage: React.FC = () => {
  // For debugging provider values
  const debugProvider1Ref = useRef<InfraResourceProvider | undefined>(undefined);
  const debugProvider2Ref = useRef<InfraResourceProvider | undefined>(undefined);

  // --- State for VPC 1 Selection ---
  const [provider1, setProvider1] = useState<InfraResourceProvider>(InfraResourceProvider.AWS);
  const [accountId1, setAccountId1] = useState<string>('');
  const [region1, setRegion1] = useState<string>('');
  const [vpcId1, setVpcId1] = useState<string>('');

  // Log provider1 whenever it changes
  useEffect(() => {
    console.log('[DEBUG] provider1 changed to:', provider1);
    console.log('[DEBUG] provider1 type:', typeof provider1);
    debugProvider1Ref.current = provider1;
  }, [provider1]);

  // NO CONVERSION HERE - just pass the actual provider value
  // Hooks for VPC 1
  console.log('[DEBUG] Before useFetchVpcAccounts - provider1:', provider1);
  
  // Convert provider1 to string for API calls - required for the hooks that expect string
  const provider1AsString = String(provider1);
  console.log('[DEBUG] Provider1 as string:', provider1AsString);
  
  // Function to monkey-patch fetch for debugging
  const monitorFetch = () => {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      console.log('[NETWORK DEBUG] Fetch call:', input);
      if (init && init.body) {
        try {
          const body = JSON.parse(init.body.toString());
          console.log('[NETWORK DEBUG] Request body:', body);
          // Highlight provider in request
          if (body && body.provider) {
            console.log('[NETWORK DEBUG] REQUEST PROVIDER:', body.provider, typeof body.provider);
          }
        } catch (e) {
          console.log('[NETWORK DEBUG] Request body (raw):', init.body);
        }
      }
      if (init && init.headers) {
        console.log('[NETWORK DEBUG] Request headers:', init.headers);
      }
      return originalFetch.apply(this, [input, init]).then(response => {
        // Clone the response so we can log it without consuming it
        const responseClone = response.clone();
        responseClone.json().then(body => {
          console.log('[NETWORK DEBUG] Response:', body);
        }).catch(() => {
          console.log('[NETWORK DEBUG] Response is not JSON');
        });
        return response;
      });
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  };
  
  // Start monitoring fetch in component mount
  useEffect(() => {
    console.log('[DEBUG] Setting up fetch monitoring');
    const cleanup = monitorFetch();
    return cleanup;
  }, []);
  
  // Pass provider directly, as it comes from the state
  const { vpcAccounts: accounts1List = [], fetchAccounts: fetchAccounts1 } = useFetchVpcAccounts(provider1AsString);
  const { vpcRegions: regions1List = [], fetchRegions: fetchRegions1 } = useFetchRegions(provider1AsString);
  const { vpcs: vpcs1List = [] as VpcFromHook[], fetchVpcs: fetchVpcs1, clearVpcs: clearVpcs1 } = useFetchVpcsResources(
    provider1,
    accountId1 || undefined,
    region1 || undefined
  );

  // --- State for VPC 2 Selection ---
  const [provider2, setProvider2] = useState<InfraResourceProvider>(InfraResourceProvider.AWS);
  const [accountId2, setAccountId2] = useState<string>('');
  const [region2, setRegion2] = useState<string>('');
  const [vpcId2, setVpcId2] = useState<string>('');

  // State for the VPC identities used for rendering the connection graph
  const [vpc1IdentityFull, setVpc1IdentityFull] = useState<VpcIdentity | null>(null);
  const [vpc2IdentityFull, setVpc2IdentityFull] = useState<VpcIdentity | null>(null);

  // Log provider2 whenever it changes
  useEffect(() => {
    console.log('[DEBUG] provider2 changed to:', provider2);
    console.log('[DEBUG] provider2 type:', typeof provider2);
    debugProvider2Ref.current = provider2;
  }, [provider2]);

  // Hooks for VPC 2
  console.log('[DEBUG] Before useFetchVpcAccounts - provider2:', provider2);
  
  // Convert provider2 to string to match provider1 handling
  const provider2AsString = String(provider2);
  console.log('[DEBUG] Provider2 as string:', provider2AsString);
  
  const { vpcAccounts: accounts2List = [], fetchAccounts: fetchAccounts2 } = useFetchVpcAccounts(provider2AsString);
  const { vpcRegions: regions2List = [], fetchRegions: fetchRegions2 } = useFetchRegions(provider2AsString);
  const { vpcs: vpcs2List = [] as VpcFromHook[], fetchVpcs: fetchVpcs2, clearVpcs: clearVpcs2 } = useFetchVpcsResources(
    provider2,
    accountId2 || undefined,
    region2 || undefined
  );

  // --- Effects for VPC 1 ---
  useEffect(() => {
    setAccountId1('');
    setRegion1('');
    setVpcId1('');
    if (clearVpcs1) {
      clearVpcs1();
    }
    
    // Debug log before fetch
    if (provider1 && fetchAccounts1) {
      console.log('[DEBUG] About to call fetchAccounts1 with provider1:', provider1);
      console.log('[DEBUG] Current provider1 ref value:', debugProvider1Ref.current);
      
      // Create a custom version of fetchAccounts1 that logs the call
      const wrappedFetchAccounts = () => {
        console.log('[DEBUG] Inside fetchAccounts1 call, provider1 is:', provider1);
        console.log('[DEBUG] Provider type is:', typeof provider1);
        
        // Directly update the window.fetch function to monitor all requests
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          console.log('[NETWORK DEBUG] Fetch call:', input);
          
          // If this is a POST request, modify the body to force the provider value
          if (init && init.method === 'POST' && init.body) {
            try {
              const bodyObj = JSON.parse(init.body.toString());
              console.log('[NETWORK DEBUG] Original request body:', bodyObj);
              
              // If this appears to be a request that should include provider
              if (typeof bodyObj === 'object' && (
                  input.toString().includes('ListAccount') || 
                  input.toString().includes('ListRegion') ||
                  input.toString().includes('ListVPC')
              )) {
                // Force the provider value to match what we expect
                bodyObj.provider = provider1;
                console.log('[NETWORK DEBUG] FORCING provider to:', provider1);
                
                // Update the request with our modified body
                init.body = JSON.stringify(bodyObj);
              }
              
              console.log('[NETWORK DEBUG] Modified request body:', JSON.parse(init.body.toString()));
            } catch (e) {
              console.log('[NETWORK DEBUG] Could not parse body:', e);
            }
          }
          
          if (init && init.headers) {
            console.log('[NETWORK DEBUG] Request headers:', init.headers);
          }
          
          return originalFetch.apply(this, [input, init]).then(response => {
            // Clone the response so we can log it without consuming it
            const responseClone = response.clone();
            responseClone.json().then(body => {
              console.log('[NETWORK DEBUG] Response:', body);
            }).catch(() => {
              console.log('[NETWORK DEBUG] Response is not JSON');
            });
            return response;
          });
        };
        
        // Call the original fetchAccounts1
        fetchAccounts1();
        
        // Restore original fetch after a short delay
        setTimeout(() => {
          window.fetch = originalFetch;
        }, 5000);
      };
      
      wrappedFetchAccounts();
      
      console.log('[DEBUG] About to call fetchRegions1 with provider1:', provider1);
      fetchRegions1();
    } else {
      console.log('[DEBUG] Not calling fetchAccounts1 because provider1 is:', provider1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider1]);

  // When Account ID 1 changes
  useEffect(() => {
    setRegion1('');
    setVpcId1('');
    if (clearVpcs1) {
      clearVpcs1();
    }
    
    if (provider1 && accountId1 && fetchVpcs1) {
      console.log('[DEBUG] Fetching VPCs with provider1:', provider1, 'accountId1:', accountId1);
      fetchVpcs1();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider1, accountId1]);

  // When Region 1 changes - filter VPCs by region
  useEffect(() => {
    setVpcId1('');
    if (provider1 && accountId1 && region1 && fetchVpcs1) {
      console.log('[DEBUG] Fetching VPCs with region filter. provider1:', provider1, 'region1:', region1);
      fetchVpcs1();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider1, accountId1, region1]);

  // --- Effects for VPC 2 (Mirroring VPC 1 logic) ---
  useEffect(() => {
    setAccountId2('');
    setRegion2('');
    setVpcId2('');
    if (clearVpcs2) {
      clearVpcs2();
    }
    
    if (provider2 && fetchAccounts2) {
      console.log('[DEBUG] About to call fetchAccounts2 with provider2:', provider2);
      console.log('[DEBUG] Current provider2 ref value:', debugProvider2Ref.current);
      
      const wrappedFetchAccounts = () => {
        console.log('[DEBUG] Inside fetchAccounts2 call, provider2 is:', provider2);
        console.log('[DEBUG] Provider type is:', typeof provider2);
        fetchAccounts2();
      };
      
      wrappedFetchAccounts();
      fetchRegions2();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider2]);

  // When Account ID 2 changes
  useEffect(() => {
    setRegion2('');
    setVpcId2('');
    if (clearVpcs2) {
      clearVpcs2();
    }
    if (provider2 && accountId2 && fetchVpcs2) {
      console.log('[DEBUG] Fetching VPCs with provider2:', provider2, 'accountId2:', accountId2);
      fetchVpcs2();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider2, accountId2]);

  // When Region 2 changes
  useEffect(() => {
    setVpcId2('');
    if (provider2 && accountId2 && region2 && fetchVpcs2) {
      console.log('[DEBUG] Fetching VPCs with region filter. provider2:', provider2, 'region2:', region2);
      fetchVpcs2();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider2, accountId2, region2]);

  // Handle provider selection - log the values being processed
  const handleProvider1Change = (value: string) => {
    console.log('[DEBUG] handleProvider1Change called with value:', value);
    console.log('[DEBUG] value type:', typeof value);
    
    if (value === "") {
      console.log('[DEBUG] Setting provider1 to AWS (default)');
      setProvider1(InfraResourceProvider.AWS);
    } else {
      console.log('[DEBUG] Setting provider1 to:', value, 'as InfraResourceProvider');
      // Force the value to match the backend's expected format - might be case sensitive
      setProvider1(value as InfraResourceProvider);
    }
  };

  const handleProvider2Change = (value: string) => {
    console.log('[DEBUG] handleProvider2Change called with value:', value);
    console.log('[DEBUG] value type:', typeof value);
    
    if (value === "") {
      console.log('[DEBUG] Setting provider2 to AWS (default)');
      setProvider2(InfraResourceProvider.AWS);
    } else {
      console.log('[DEBUG] Setting provider2 to:', value, 'as InfraResourceProvider');
      setProvider2(value as InfraResourceProvider);
    }
  };

  const availableProviders = [
    { value: InfraResourceProvider.AWS, label: 'AWS' },
    { value: InfraResourceProvider.AZURE, label: 'Azure' },
    { value: InfraResourceProvider.GCP, label: 'GCP' },
  ];

  console.log('[DEBUG] Available providers:', availableProviders);

  const renderAccountOptions = (accounts: readonly Account[]) => (
    accounts.map(acc => <option key={acc.accountId} value={acc.accountId}>{acc.name || acc.accountId}</option>)
  );

  const renderRegionOptions = (regions: readonly Region[]) => (
    regions.map(reg => <option key={reg.region} value={reg.region}>{reg.name || reg.region}</option>)
  );

  const renderVpcOptions = (vpcs: readonly VpcFromHook[]) => (
    vpcs.map(vpc => <option key={vpc.id} value={vpc.id}>{vpc.name || vpc.id}</option>)
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="VPC Connection Graph" />
      <div style={{ display: 'flex', gap: '20px', padding: '20px', borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
        {/* Source VPC Selection UI */}
        <div style={{ flex: '1 1 45%', minWidth: '300px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Source VPC</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Provider: </label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }} 
              value={provider1} 
              onChange={(e) => {
                console.log('[DEBUG] Source Provider dropdown changed to:', e.target.value);
                handleProvider1Change(e.target.value);
              }}
            >
              <option value={InfraResourceProvider.AWS}>Select Provider</option>
              {availableProviders.map(p => {
                console.log('[DEBUG] Rendering provider option:', p.value, p.label);
                return <option key={p.value} value={p.value}>{p.label}</option>;
              })}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Account ID: </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={accountId1} onChange={(e) => setAccountId1(e.target.value)} disabled={!provider1 || accounts1List.length === 0}>
              <option value="">Select Account</option>
              {renderAccountOptions(accounts1List)}
            </select>
            <small>Provider for accounts request: {provider1 || 'none'}</small>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Region (Optional): </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={region1} onChange={(e) => setRegion1(e.target.value)} disabled={!provider1 || !accountId1 || regions1List.length === 0}>
              <option value="">All Regions</option>
              {renderRegionOptions(regions1List)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>VPC ID: </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={vpcId1} onChange={(e) => setVpcId1(e.target.value)} disabled={!provider1 || !accountId1 || vpcs1List.length === 0}>
              <option value="">Select VPC</option>
              {renderVpcOptions(vpcs1List)}
            </select>
          </div>
        </div>

        {/* Destination VPC Selection UI */}
        <div style={{ flex: '1 1 45%', minWidth: '300px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Destination VPC</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Provider: </label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }} 
              value={provider2} 
              onChange={(e) => {
                console.log('[DEBUG] Destination Provider dropdown changed to:', e.target.value);
                handleProvider2Change(e.target.value);
              }}
            >
              <option value={InfraResourceProvider.AWS}>Select Provider</option>
              {availableProviders.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Account ID: </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={accountId2} onChange={(e) => setAccountId2(e.target.value)} disabled={!provider2 || accounts2List.length === 0}>
              <option value="">Select Account</option>
              {renderAccountOptions(accounts2List)}
            </select>
            <small>Provider for accounts request: {provider2 || 'none'}</small>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Region (Optional): </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={region2} onChange={(e) => setRegion2(e.target.value)} disabled={!provider2 || !accountId2 || regions2List.length === 0}>
              <option value="">All Regions</option>
              {renderRegionOptions(regions2List)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>VPC ID: </label>
            <select style={{ width: '100%', padding: '8px', borderRadius: '4px' }} value={vpcId2} onChange={(e) => setVpcId2(e.target.value)} disabled={!provider2 || !accountId2 || vpcs2List.length === 0}>
              <option value="">Select VPC</option>
              {renderVpcOptions(vpcs2List)}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            borderRadius: '4px', 
            border: 'none',
            fontSize: '16px',
            cursor: (provider1 && accountId1 && vpcId1 && provider2 && accountId2 && vpcId2) ? 'pointer' : 'not-allowed',
            opacity: (provider1 && accountId1 && vpcId1 && provider2 && accountId2 && vpcId2) ? 1 : 0.6
          }}
          disabled={!(provider1 && accountId1 && vpcId1 && provider2 && accountId2 && vpcId2)}
          onClick={() => {
            // Create the VPC identities for the connection graph
            const sourceVpcIdentity: VpcIdentity = {
              provider: provider1,
              accountId: accountId1,
              region: region1 || '',
              vpcId: vpcId1
            };
            
            const destVpcIdentity: VpcIdentity = {
              provider: provider2,
              accountId: accountId2,
              region: region2 || '',
              vpcId: vpcId2
            };
            
            // Set the VPC identities for rendering
            setVpc1IdentityFull(sourceVpcIdentity);
            setVpc2IdentityFull(destVpcIdentity);
          }}
        >
          Generate Connection Graph
        </button>
      </div>

      {/* Debug info section */}
      <div style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px', fontSize: '12px' }}>
        <h4>Debug Information:</h4>
        <p>Source Provider: {provider1 || 'undefined'} (type: {typeof provider1})</p>
        <p>Destination Provider: {provider2 || 'undefined'} (type: {typeof provider2})</p>
        <p>Account lists loaded: Source ({accounts1List.length}), Destination ({accounts2List.length})</p>
      </div>

      {vpc1IdentityFull && vpc2IdentityFull ? (
        <VPCConnectionGraph
          vpc1Identity={vpc1IdentityFull}
          vpc2Identity={vpc2IdentityFull}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Please select all required details for both Source and Destination VPCs and click "Generate Connection Graph" to view the connection graph.
        </div>
      )}
    </DefaultLayout>
  );
};

export default VPCConnectionPage;