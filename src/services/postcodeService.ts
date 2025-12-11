// UK Postcode Lookup Service
// Uses postcodes.io API (free UK postcode API)

export interface PostcodeResult {
  postcode: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhs_ha: string;
  longitude: number;
  latitude: number;
  european_electoral_region: string;
  primary_care_trust: string;
  region: string;
  lsoa: string;
  msoa: string;
  incode: string;
  outcode: string;
  parliamentary_constituency: string;
  admin_district: string;
  parish: string;
  admin_county: string;
  admin_ward: string;
  ced: string;
  ccg: string;
  nuts: string;
  codes: {
    admin_district: string;
    admin_county: string;
    admin_ward: string;
    parish: string;
    parliamentary_constituency: string;
    ccg: string;
    ccg_id: string;
    ced: string;
    nuts: string;
    lsoa: string;
    msoa: string;
    lau2: string;
  };
}

export interface AddressSuggestion {
  postcode: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  county: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface PostcodeValidationResult {
  valid: boolean;
  postcode?: string;
  message: string;
}

class PostcodeService {
  private readonly BASE_URL = 'https://api.postcodes.io';
  
  // Validate UK postcode format
  validatePostcode(postcode: string): PostcodeValidationResult {
    const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
    
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;
    
    if (!postcodeRegex.test(cleanPostcode)) {
      return {
        valid: false,
        message: 'Invalid UK postcode format'
      };
    }
    
    // Format postcode with space
    const formattedPostcode = cleanPostcode.replace(/^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/, '$1 $2');
    
    return {
      valid: true,
      postcode: formattedPostcode,
      message: 'Valid postcode format'
    };
  }
  
  // Lookup postcode details
  async lookupPostcode(postcode: string): Promise<PostcodeResult | null> {
    try {
      const validation = this.validatePostcode(postcode);
      if (!validation.valid || !validation.postcode) {
        throw new Error(validation.message);
      }
      
      const response = await fetch(`${this.BASE_URL}/postcodes/${encodeURIComponent(validation.postcode)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Postcode not found');
        }
        throw new Error('Failed to lookup postcode');
      }
      
      const data = await response.json();
      return data.result as PostcodeResult;
    } catch (error) {
      console.error('Postcode lookup error:', error);
      throw error;
    }
  }
  
  // Search for postcodes near a given postcode
  async getNearbyPostcodes(postcode: string, limit: number = 10): Promise<PostcodeResult[]> {
    try {
      const validation = this.validatePostcode(postcode);
      if (!validation.valid || !validation.postcode) {
        throw new Error(validation.message);
      }
      
      const response = await fetch(`${this.BASE_URL}/postcodes/${encodeURIComponent(validation.postcode)}/nearest?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get nearby postcodes');
      }
      
      const data = await response.json();
      return data.result as PostcodeResult[];
    } catch (error) {
      console.error('Nearby postcodes error:', error);
      throw error;
    }
  }
  
  // Autocomplete postcode suggestions
  async autocompletePostcode(query: string, limit: number = 10): Promise<PostcodeResult[]> {
    try {
      if (query.length < 2) {
        return [];
      }
      
      const response = await fetch(`${this.BASE_URL}/postcodes?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Postcode autocomplete error:', error);
      return [];
    }
  }
  
  // Convert postcode result to address suggestion
  postcodeToAddressSuggestion(postcodeResult: PostcodeResult): AddressSuggestion {
    const addressParts = [];
    
    if (postcodeResult.admin_ward) {
      addressParts.push(postcodeResult.admin_ward);
    }
    
    if (postcodeResult.admin_district && postcodeResult.admin_district !== postcodeResult.admin_ward) {
      addressParts.push(postcodeResult.admin_district);
    }
    
    const city = postcodeResult.admin_district || postcodeResult.parish || '';
    const county = postcodeResult.admin_county || postcodeResult.region || '';
    
    return {
      postcode: postcodeResult.postcode,
      address_line_1: addressParts.join(', ') || city,
      city: city,
      county: county,
      country: postcodeResult.country,
      latitude: postcodeResult.latitude,
      longitude: postcodeResult.longitude,
      formatted_address: `${addressParts.join(', ')}, ${city}, ${county}, ${postcodeResult.postcode}`
    };
  }
  
  // Get address suggestions from postcode
  async getAddressSuggestions(postcode: string): Promise<AddressSuggestion[]> {
    try {
      const postcodeResult = await this.lookupPostcode(postcode);
      if (!postcodeResult) {
        return [];
      }
      
      // Get nearby postcodes for more suggestions
      const nearbyPostcodes = await this.getNearbyPostcodes(postcode, 5);
      const allPostcodes = [postcodeResult, ...nearbyPostcodes];
      
      return allPostcodes.map(pc => this.postcodeToAddressSuggestion(pc));
    } catch (error) {
      console.error('Address suggestions error:', error);
      return [];
    }
  }
  
  // Reverse geocoding - find postcode from coordinates
  async reverseGeocode(latitude: number, longitude: number): Promise<PostcodeResult | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/postcodes?lon=${longitude}&lat=${latitude}&limit=1`);
      
      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }
      
      const data = await response.json();
      return data.result?.[0] || null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  }
  
  // Bulk postcode lookup
  async bulkLookupPostcodes(postcodes: string[]): Promise<(PostcodeResult | null)[]> {
    try {
      const validatedPostcodes = postcodes.map(pc => {
        const validation = this.validatePostcode(pc);
        return validation.valid ? validation.postcode : null;
      }).filter(Boolean);
      
      if (validatedPostcodes.length === 0) {
        return [];
      }
      
      const response = await fetch(`${this.BASE_URL}/postcodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postcodes: validatedPostcodes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to bulk lookup postcodes');
      }
      
      const data = await response.json();
      return data.result?.map((item: any) => item.result) || [];
    } catch (error) {
      console.error('Bulk lookup error:', error);
      return [];
    }
  }
}

export const postcodeService = new PostcodeService();
