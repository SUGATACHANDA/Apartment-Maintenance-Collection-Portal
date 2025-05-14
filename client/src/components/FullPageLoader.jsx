import React from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-gray-600 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default FullPageLoader;
