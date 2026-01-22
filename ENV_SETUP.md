# Hướng dẫn tối ưu tốc độ load

## Cách 1: Dùng file .bat trên Windows (Khuyến nghị - Dễ nhất)

Chạy file `start-fast.bat` đã được tạo sẵn:

```bash
start-fast.bat
```

Hoặc double-click vào file `start-fast.bat` trong thư mục `fe/`

## Cách 2: Tạo file .env (Khuyến nghị - Hoạt động tốt nhất)

Tạo file `.env` trong thư mục `fe/` với nội dung sau:

Tạo file `.env` trong thư mục `fe/` với nội dung:

```
# Tắt source maps - giúp build nhanh hơn 50-70%
GENERATE_SOURCEMAP=false

# Tắt file watching polling (nhanh hơn trên Windows)
WATCHPACK_POLLING=false
CHOKIDAR_USEPOLLING=false

# Bật Fast Refresh
FAST_REFRESH=true

# Nếu có API URL thì thêm vào
# REACT_APP_API_URL=http://localhost:3001/api
```

Sau đó chạy bình thường:

```bash
npm start
```

## Cách 3: Dùng script trong package.json

```bash
npm run start:fast
```

**Lưu ý:** Cách này có thể không hoạt động trên Windows, nên dùng Cách 1 hoặc Cách 2.

## Các tối ưu đã áp dụng:

1. **GENERATE_SOURCEMAP=false** - Tắt source maps, giúp build nhanh hơn rất nhiều (tiết kiệm 50-70% thời gian)
2. **WATCHPACK_POLLING=false** - Tắt polling cho file watching (nhanh hơn trên Windows)
3. **CHOKIDAR_USEPOLLING=false** - Tắt chokidar polling
4. **FAST_REFRESH=true** - Bật Fast Refresh để hot reload nhanh hơn

## Lưu ý:

- Khi tắt source maps, bạn sẽ không debug được trong browser DevTools (nhưng vẫn có thể dùng console.log)
- Nếu cần debug, có thể bật lại bằng cách xóa `GENERATE_SOURCEMAP=false` khỏi script
- Các tối ưu này chỉ ảnh hưởng đến development, không ảnh hưởng production build
