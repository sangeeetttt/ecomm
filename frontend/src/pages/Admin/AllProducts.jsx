import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAllProductsQuery } from '../../redux/api/productApiSlice';
import AdminMenu from './AdminMenu';

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading products</div>;
  }

  return (
    <>
      <div className="container mx-[7rem]">
        <div className="flex flex-col md:flex-row">
          <div className="p-2">
            <div className="ml-[1rem] text-lg font-bold h-10">
              All Products ({products.length})
            </div>
            <div className="flex flex-wrap justify-around items-center">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/admin/product/update/${product._id}`}
                  className="block mb-2 overflow-hidden"
                >
                  <div className="flex">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-[8rem] object-cover"
                    />
                    <div className="p-2 flex flex-col justify-around">
                      <div className="flex justify-between">
                        <h5 className="text-lg font-semibold mb-1">
                          {product?.name}
                        </h5>

                        <p className="text-gray-400 text-xs">
                          {moment(product.createdAt).format('MMMM Do YYYY')}
                        </p>
                      </div>

                      <p className="text-gray-400 xl:w-[28rem] lg:w-[28rem] md:w-[18rem] sm:w-[8rem] text-sm mb-2">
                        {product?.description?.substring(0, 120)}...
                      </p>

                      <div className="flex justify-between">
                        <Link
                          to={`/admin/product/update/${product._id}`}
                          className="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
                        >
                          Update Product
                          <svg
                            className="w-3 h-3 ml-1"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                          </svg>
                        </Link>
                        <p className="text-sm">$ {product?.price}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="md:w-1/4 p-2 mt-1">
            <AdminMenu />
          </div>
        </div>
      </div>
    </>
  );
};

export default AllProducts;
