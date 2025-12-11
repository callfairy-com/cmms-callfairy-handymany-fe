import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { postcodeService, AddressSuggestion } from '../../services/postcodeService';

interface AddressFinderProps {
  onAddressSelect: (address: AddressSuggestion) => void;
  initialPostcode?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface AddressDetails {
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export const AddressFinder: React.FC<AddressFinderProps> = ({
  onAddressSelect,
  initialPostcode = '',
  placeholder = 'Enter UK postcode (e.g., SW1A 1AA)',
  className = '',
  disabled = false
}) => {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [manualAddress, setManualAddress] = useState<AddressDetails>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom'
  });
  const [showManualEntry, setShowManualEntry] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle postcode input and search
  const handlePostcodeChange = async (value: string) => {
    setPostcode(value);
    setError(null);

    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // First try to get autocomplete suggestions
      const autocompleteSuggestions = await postcodeService.autocompletePostcode(value, 8);

      if (autocompleteSuggestions.length > 0) {
        const addressSuggestions = autocompleteSuggestions.map(pc =>
          postcodeService.postcodeToAddressSuggestion(pc)
        );
        setSuggestions(addressSuggestions);
        setIsOpen(true);
      } else {
        // If no autocomplete results, try direct lookup
        const validation = postcodeService.validatePostcode(value);
        if (validation.valid) {
          try {
            const postcodeResult = await postcodeService.lookupPostcode(value);
            if (postcodeResult) {
              const addressSuggestion = postcodeService.postcodeToAddressSuggestion(postcodeResult);
              setSuggestions([addressSuggestion]);
              setIsOpen(true);
            }
          } catch (lookupError) {
            // Ignore lookup errors for partial postcodes
          }
        }
      }
    } catch (error) {
      console.error('Postcode search error:', error);
      setError('Unable to search postcodes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setPostcode(suggestion.postcode);
    setIsOpen(false);
    setSelectedIndex(-1);
    setError(null);
    onAddressSelect(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const postcodeResult = await postcodeService.reverseGeocode(latitude, longitude);

          if (postcodeResult) {
            const addressSuggestion = postcodeService.postcodeToAddressSuggestion(postcodeResult);
            setPostcode(postcodeResult.postcode);
            onAddressSelect(addressSuggestion);
          } else {
            setError('Could not find postcode for your location');
          }
        } catch {
          setError('Failed to get address from location');
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        setError('Unable to get your location');
      }
    );
  };

  // Handle manual address entry
  const handleManualAddressSubmit = () => {
    if (!manualAddress.addressLine1 || !manualAddress.city || !manualAddress.postcode) {
      setError('Please fill in all required fields');
      return;
    }

    const addressSuggestion: AddressSuggestion = {
      postcode: manualAddress.postcode,
      address_line_1: manualAddress.addressLine1,
      address_line_2: manualAddress.addressLine2,
      city: manualAddress.city,
      county: manualAddress.county,
      country: manualAddress.country,
      latitude: manualAddress.latitude || 0,
      longitude: manualAddress.longitude || 0,
      formatted_address: `${manualAddress.addressLine1}${manualAddress.addressLine2 ? ', ' + manualAddress.addressLine2 : ''}, ${manualAddress.city}, ${manualAddress.county}, ${manualAddress.postcode}`
    };

    onAddressSelect(addressSuggestion);
    setShowManualEntry(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="space-y-4">
        {/* Postcode Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Address Lookup
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={postcode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : ''
                } ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={disabled || isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 disabled:cursor-not-allowed"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.postcode}-${index}`}
                ref={el => suggestionRefs.current[index] = el}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-blue-50 ${selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {suggestion.formatted_address}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {suggestion.postcode}
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual Entry Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showManualEntry ? 'Use postcode lookup' : 'Enter address manually'}
          </button>
        </div>

        {/* Manual Address Entry Form */}
        {showManualEntry && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
            <h4 className="text-sm font-medium text-slate-900">Manual Address Entry</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.addressLine1}
                  onChange={(e) => setManualAddress({ ...manualAddress, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={manualAddress.addressLine2}
                  onChange={(e) => setManualAddress({ ...manualAddress, addressLine2: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.city}
                  onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  County
                </label>
                <input
                  type="text"
                  value={manualAddress.county}
                  onChange={(e) => setManualAddress({ ...manualAddress, county: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="County"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.postcode}
                  onChange={(e) => setManualAddress({ ...manualAddress, postcode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SW1A 1AA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={manualAddress.country}
                  onChange={(e) => setManualAddress({ ...manualAddress, country: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United Kingdom"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualAddressSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Use This Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
