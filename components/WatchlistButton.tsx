'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon,
  type = 'button',
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const handleClick = () => {
    if (onWatchlistChange) {
      onWatchlistChange(symbol, !isInWatchlist);
    }
    // Logic for adding/removing from watchlist would go here
    console.log(`${isInWatchlist ? 'Removing' : 'Adding'} ${symbol} (${company}) ${isInWatchlist ? 'from' : 'to'} watchlist`);
  };

  if (type === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={isInWatchlist ? 'text-yellow-500' : 'text-gray-400'}
      >
        <Star className={isInWatchlist ? 'fill-current' : ''} />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="flex items-center gap-2 border-gray-700 bg-transparent text-gray-100 hover:bg-gray-800 hover:text-yellow-500"
    >
      <Star className={isInWatchlist ? 'fill-yellow-500 text-yellow-500' : ''} />
      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </Button>
  );
};

export default WatchlistButton;
