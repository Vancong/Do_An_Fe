import React, { useState } from 'react'
import FilterSidebarComponent from '../../components/FilterSidebarComponent/FilterSidebarComponent'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Row, Col, Pagination, Select, Drawer, Button } from "antd";
import { FilterOutlined } from '@ant-design/icons';
import './TypeProductsPage.scss';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import *as ProductService from "../../services/Product.Services"
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import NavigationPathComponent from '../../components/NavigationPathComponent/NavigationPathComponent';
import *as FavoriteService from "../../services/Favorite.Service"
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductListSection from '../../components/ProductListSection/ProductListSection';
const TypeProductsPage = () => {

  const location = useLocation();
  let { state } = location;
  const [searchParams] = useSearchParams();
  const { type: slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [sortOption, setSortOption] = useState('newProduct');
  const [keyValue, setKeyValue] = useState({ key: 'createdAt', value: -1 })
  const searchKeyword = useSelector(state => state.product.search);
  const user = useSelector((state) => state.user)
  const [isOpenFilter, setIsOpenFilter] = useState(false);

  const genderMap = {
    'Nước Hoa Nam': 'Male',
    'Nước Hoa Nữ': 'Female',
    'Nước Hoa Unisex': 'Unisex',
    'nuoc-hoa-nam': 'Male',
    'nuoc-hoa-nu': 'Female',
    'nuoc-hoa-unisex': 'Unisex',
  };

  let filters = {
    gender: searchParams.get('gender') || '',
    notes: searchParams.get('notes')?.split(',') || [],
    price: searchParams.get('price') || '',
    brands: searchParams.get('brands')?.split(',') || [],
  };

  const buildFilters = () => {
    const onFilters = {};
    if (filters?.gender) {
      onFilters.gender = genderMap[filters.gender];

    } else if (slug !== 'loc-san-pham' && slug !== 'dealthom') {
      onFilters.gender = genderMap[slug];
    }
    if (filters?.price) onFilters.price = filters.price;
    if (filters?.brands?.length) onFilters.brands = filters.brands;
    if (filters?.notes?.length) onFilters.notes = filters.notes;

    if (slug === 'deal-thom') {
      onFilters.discount = true;
    }
    return onFilters;
  };

  filters = buildFilters();


  let { data: products, isLoading } = useQuery({
    queryKey: ['products-type', slug, currentPage, limit, filters, searchKeyword, keyValue],
    queryFn: () => ProductService.getAllProduct({
      page: currentPage, limit, filters,
      search: searchKeyword, key: keyValue.key, value: keyValue.value
    }),
    placeholderData: keepPreviousData,
    enabled: slug !== 'favorite'
  });


  const { data: productsFavorite, isLoadingFavorite, isError: isErrorFavorite, error: errorFavorite, isFetching: isFetchingFavorite } = useQuery({
    queryKey: ['products-favorite', slug, user?.id],
    queryFn: async () => {
      try {
        const result = await FavoriteService.getUserFavorite(user?.id, user.access_token);
        return result;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: slug === 'favorite' && !!user?.id && !!user?.access_token,
    retry: false,
    refetchOnWindowFocus: false,
  });


  // eslint-disable-next-line no-unused-vars
  const onChangeValue = (value) => {
    setSortOption(value);
    if (value === 'newProduct') {
      setKeyValue({ key: 'createdAt', value: -1 });
    }
    else if (value === 'price-desc') {
      setKeyValue({ key: 'price', value: -1 });
    }
    else if (value === 'price-asc') {
      setKeyValue({ key: 'price', value: 1 });
    }

    setCurrentPage(1)
  }

  let productDataRender = products?.data;

  if (!state && slug === 'search') {
    state = `Kết quả tìm kiếm cua "${searchKeyword}"`
  }
  else if (!state && slug === 'favorite') {
    state = `Sản phẩm yêu thích`
    // Chỉ set data khi đã có kết quả và không đang loading
    if (productsFavorite && !isLoadingFavorite) {
      productDataRender = productsFavorite?.data || [];
      productDataRender = productDataRender.filter(item => item !== null && item !== undefined);
    } else if (!isLoadingFavorite && !isFetchingFavorite) {
      // Nếu không loading và không có data, set empty array
      productDataRender = [];
    } else {
      // Đang loading, giữ nguyên (có thể là undefined)
      productDataRender = productsFavorite?.data || [];
    }
  }

  // Xác định loading state dựa trên slug
  // Chỉ loading khi đang fetch lần đầu (isLoading) hoặc đang fetch lại (isFetching) và chưa có lỗi
  const isPageLoading = slug === 'favorite'
    ? ((isLoadingFavorite || isFetchingFavorite) && !isErrorFavorite && !productsFavorite)
    : isLoading;

  // Xử lý khi không có user hoặc có lỗi
  if (slug === 'favorite' && !user?.id) {
    return (
      <div className='container'>
        <div className='type_product'>
          <NavigationPathComponent category="Sản phẩm yêu thích" />
          <h1 className='title_slug'>Sản phẩm yêu thích</h1>
          <p style={{ color: 'red', marginTop: 20, textAlign: 'center' }}>Vui lòng đăng nhập để xem sản phẩm yêu thích</p>
        </div>
      </div>
    );
  }

  if (slug === 'favorite' && isErrorFavorite) {
    return (
      <div className='container'>
        <div className='type_product'>
          <NavigationPathComponent category="Sản phẩm yêu thích" />
          <h1 className='title_slug'>Sản phẩm yêu thích</h1>
          <p style={{ color: 'red', marginTop: 20, textAlign: 'center' }}>
            {errorFavorite?.message || 'Có lỗi xảy ra khi tải danh sách yêu thích'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadingComponent isPending={isPageLoading} >
      <div className='container'>
        <div className='type_product'>
          <NavigationPathComponent category={state} />
          <h1 className='title_slug'>
            {
              productDataRender?.length === 0
                ? state
                  ? `${state} - Không tìm thấy sản phẩm nào!`
                  : 'Không tìm thấy sản phẩm nào!'
                : slug === 'loc-san-pham'
                  ? 'Kết quả lọc sản phẩm'
                  : state
            }
          </h1>



          <div>
            <Button
              className="mobile-filter-btn"
              icon={<FilterOutlined />}
              onClick={() => setIsOpenFilter(true)}
            >
              Bộ lọc
            </Button>

            <Drawer
              title="Bộ lọc sản phẩm"
              placement="left"
              onClose={() => setIsOpenFilter(false)}
              open={isOpenFilter}
              width="80%"
            >
              <FilterSidebarComponent
                slug={slug}
                setCurrentPage={setCurrentPage}
                onClose={() => setIsOpenFilter(false)}
              />
            </Drawer>

            <Row gutter={24} wrap style={{ paddingTop: '10px' }}>

              {slug !== 'search' && slug !== 'favorite' && (
                <Col span={6} xs={0} sm={0} md={6} lg={6} xl={6} className='col_navbar'>
                  <FilterSidebarComponent slug={slug} setCurrentPage={setCurrentPage}
                  />
                </Col>
              )}
              <Col xs={24} sm={24} md={slug === 'search' || slug === 'favorite' ? 24 : 18} span={slug === 'search' || slug === 'favorite' ? 24 : 18}>


                <div className="products_grid">
                  {productDataRender?.map(product => (
                    <CardComponent
                      width={216}
                      key={product._id}
                      images={product.images}
                      name={product.name}
                      sizes={product.sizes}
                      selled={product.selled}
                      slug={product.slug}
                      state={state}
                      product={product}
                    />
                  ))}
                </div>

                {productDataRender?.length > 0 && (
                  <div className='pagination-wrapper'>
                    <Pagination
                      total={products?.total}
                      current={currentPage}
                      pageSize={limit}
                      onChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </Col>
            </Row>


          </div>
        </div>
        <ProductListSection
          title="Sản phẩm đang trong thời gian khuyến mãi"
          queryKey="saleProducts"
          keySort="discount"
          valueSort={-1}
        />
      </div>
    </LoadingComponent>
  )
}

export default TypeProductsPage



