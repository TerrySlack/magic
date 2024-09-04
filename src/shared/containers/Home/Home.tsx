import { ChangeEvent, useEffect, useState } from "react";
import nftsData from "../../../nfts.json";
// Use this when reseting an array
const emptyArray = [];

interface NFT {
  name: string;
  image: string;
  favorite: boolean;
  tokenId: string;
}

// One time data transformation
const transformData: NFT[] = nftsData.ownedNfts.map(
  ({
    tokenId,
    name,
    contract: {
      openSeaMetadata: { imageUrl },
    },
  }) => ({
    tokenId,
    name: name ?? "Undefined Name",
    image: imageUrl,
    favorite: false,
  })
);

function HomeContainer() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [nfts, setNfts] = useState<NFT[]>(transformData);
  const [filteredNfts, setFilteredNfts] = useState<NFT[] | undefined>();
  const [, setFavorites] = useState<NFT[] | undefined>();

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    // DO I need this?
    e.preventDefault();

    const { value } = e.currentTarget;
    const lowerCaseValue = value.toLocaleLowerCase(); // Let's account for all languages

    if (value.trim() === "") {
      // The user had not entered a value, set the filtered array to an empty array
      setFilteredNfts(emptyArray);
    }

    const filtered = nfts.reduce((acc, nft: NFT) => {
      if (nft.name.toLocaleLowerCase().includes(lowerCaseValue)) {
        acc.push(nft);
      }
      return acc;
    }, []);

    setFilteredNfts(filtered);
    setSearchTerm(value);
  };

  const selectFavorite = (id: string) => () => {
    // Iterate through to set favorite to ture, if the id matches an nft tokenId
    const { updatedNfts, filteredFavorites } = nfts.reduce(
      (acc, nft: NFT) => {
        const newNft = { ...nft };
        // Reset all favorite values, based on the user selection
        if (id === newNft.tokenId) {
          newNft.favorite = !newNft.favorite;
        }

        if (newNft.favorite) {
          // Rather than run a filter against the updatedNfts, just do the filtering here
          // add to the selected favorites
          acc.filteredFavorites.push(newNft.tokenId);
        }

        acc.updatedNfts.push(newNft);
        return acc;
      },
      { updatedNfts: [], filteredFavorites: [] }
    );

    setNfts(updatedNfts);
    setFavorites(filteredFavorites);

    // Store the array in localstorage
    localStorage.setItem("favorites", JSON.stringify(filteredFavorites));
  };

  useEffect(() => {
    // Load the filtered array from localStorage on component mount
    const storedFavoritesArray = localStorage.getItem("favorites");

    if (storedFavoritesArray) {
      const withFavorites = JSON.parse(storedFavoritesArray);
      if (withFavorites.length > 0) {
        const nftsWithStoredFavorites = nfts.reduce((acc, nft: NFT) => {
          // Set the favorite value from the stored favories
          acc.push({ ...nft, favorite: withFavorites.includes(nft.tokenId) });
          return acc;
        }, []);

        setNfts(nftsWithStoredFavorites);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-indigo-500">
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          className="w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type to search for NFT's"
          onChange={onSearch}
          defaultValue={searchTerm}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M16.65 12.35A6.35 6.35 0 1112 5.65a6.35 6.35 0 014.65 11.7z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {filteredNfts && filteredNfts.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <h1>No results found</h1>
          </div>
        )}

        {searchTerm.length > 0 &&
          filteredNfts &&
          filteredNfts.length > 0 &&
          filteredNfts.map(({ tokenId, image, name, favorite }: NFT) => (
            <div
              key={tokenId}
              className="flex flex-col items-center justify-center w-32 rounded-md shadow-md"
            >
              <div className="flex justify-center w-32 h-32">
                <img
                  src={image}
                  alt={name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col items-center  w-32 h-16">
                <button
                  type="button"
                  onClick={selectFavorite(tokenId)}
                  className="glow-border button  w-32 h-8"
                >
                  Favorite
                </button>
                <div className="flex justify-center items-center  w-32 h-8">
                  {favorite && <span className="favorite" />}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export { HomeContainer as Home };
