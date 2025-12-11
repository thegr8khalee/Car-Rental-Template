import React, { useEffect } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminOpsStore } from '../../store/useAdminOpsStore';
import CarSearchBar from '../Searchbar';

const AdminListings = () => {
  const {
    getListings,
    listings,
    totalPages,
    currentPage,
    isFetchingListings,
    listingError,
  } = useDashboardStore();

  useEffect(() => {
    getListings({ page: 1, limit: 10 });
  }, [getListings]);

  console.log(listings);

  const handlePageChange = (page) => {
    const params = { page };
    getListings(params);
  };

  if (isFetchingListings) return <div>Loading...</div>;
  if (listingError) return <div>Error: {listingError}</div>;
  if (listings.length === 0) return <div>No listings found.</div>;
  return (
    <div className="bg-base-200 rounded-lg space-y-2 max-h-[80vh] overflow-y-auto">
      {/* <CarSearchBar /> */}
      <h1 className='text-primary'>{listings.length} Listings</h1>
      {listings.map((listing) => (
        <ListCard key={listing.id} item={listing} />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Go to Page 1 button */}
          {totalPages > 3 && currentPage > 3 && (
            <button
              onClick={() => handlePageChange(1)}
              className="btn btn-circle btn-primary"
            >
              1
            </button>
          )}
          {/* Prev Button */}
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="btn btn-circle btn-primary"
            >
              <ChevronLeft className="size-5 text-white" />
            </button>
          )}
          {/* Page Numbers */}
          {[...Array(totalPages)]
            .map((_, index) => index + 1)
            .filter(
              (page) =>
                page >= currentPage - 2 &&
                page <= currentPage + 2
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-circle ${
                  page === currentPage
                    ? 'btn-primary text-white btn-circle'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          {/* Next Button */}
          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="btn rounded-full btn-primary"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ListCard = ({ item }) => {
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(null);
  const [dropdownHeight, setDropdownHeight] = React.useState(0);
  const dropdownRef = React.useRef(null);
  const { deleteCar } = useAdminOpsStore();
  const { getListings } = useDashboardStore();

  React.useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight);
    }
  }, [isDropDownOpen]);

  const handleDropDownClick = (item) => {
    if (isDropDownOpen === item) {
      setIsDropDownOpen(null);
    } else {
      setIsDropDownOpen(item);
    }
  };

  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/admin/cars/update/${id}`);
  };
  const handleDelete = (id) => {
    window.confirm('Are you sure you want to delete this listing?') &&
      deleteCar(id).then(() => {
        getListings({ page: 1, limit: 10 });
      });
  };

  return (
    <div className="rounded-xl bg-base-100">
      <div className="w-full flex items-center justify-between p-2">
        <figure>
          <img src={item.imageUrls[0]} alt="" className="w-24 h-18" />
        </figure>
        <div className="h-full flex flex-col space-y-2 p-1 w-full">
          <h2 className="font-medium text-sm sm:text-base font-[inter] flex flex-col sm:flex-row">
            {item.make + ' ' + item.model + ' ' + item.year}
            <span className="text-gray-400 font-normal capitalize flex items-center sm:ml-2 mt-1 sm:mt-0 text-sm">
              <User className="size-4" />
              {item.condition}
            </span>
          </h2>
          <p className="text-sm font-[inter]">N{item.price.toLocaleString()}</p>
          {/* <p className='text-sm font-[inter]'>Mileage: {item.mileage.toLocaleString()} miles</p>
        <p className='text-sm font-[inter]'>Status: {item.sold ? 'Sold' : 'Available'}</p> */}
        </div>
        <div>
          <p
            className={`text-sm font-[montserrat] ${
              !item.sold ? 'text-green-500' : 'text-primary'
            }`}
          >
            {item.sold ? 'Sold' : 'Available'}
          </p>
        </div>
        <button
          onClick={() => handleDropDownClick(item.id)}
          className="btn btn-circle btn-ghost"
        >
          <span
            className={`transition-transform duration-300 ease-in-out ${
              isDropDownOpen === item.id ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown />
          </span>
        </button>
      </div>
      <div
        ref={dropdownRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isDropDownOpen === item.id ? `${dropdownHeight}px` : '0px',
          opacity: isDropDownOpen === item.id ? 1 : 0,
        }}
      >
        <div className="flex p-2">
          <button
            onClick={() => handleEdit(item.id)}
            className="btn-primary btn m-2 p-2 flex-1 rounded-full"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="btn-outline border-primary border-2 text-primary btn m-2 p-2 flex-1 rounded-full"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminListings;
