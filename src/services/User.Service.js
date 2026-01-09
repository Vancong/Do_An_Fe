import axios from "axios"
import axiosJwt from "./axiosJwt";
import { jwtDecode } from 'jwt-decode';


export const loginUser = async (data) => {
   try {

    const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/sign-in`, data,{withCredentials: true});
    return res.data;
    
  } catch (error) {
    const errResponse = error?.response?.data;
    return {
      status: 'ERR',
      message: errResponse?.message 
    };
  }
};


export const signUpUser = async (data) => {
  try {

    const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/sign-up`, data, {withCredentials: true});
    return res.data;
    
  } catch (error) {
     const errResponse = error?.response?.data;
      return {
      status: 'ERR',
      message: errResponse?.message 
    };
   
  }
};

export const getDetailUser = async (id,access_token) => {

  const res = await axiosJwt.get(`${process.env.REACT_APP_API_URL}/user/get-detail/${id}`, {
    headers:{
      token:`Bearer ${access_token}`,

    }
  });
  return res.data;

};

export const getAlllUser = async (page,limit,search,access_token) => {

  const res = await axiosJwt.get(`${process.env.REACT_APP_API_URL}/user/getAll`,{
    params: { page, limit ,search},
    headers:{
      token:`Bearer ${access_token}`,
    }
  });

  return res.data;

};

export const refreshToken=async () => {

  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/refresh-token`, {},{
     withCredentials: true
  }
  );
  
  // Nếu có access_token mới, lưu vào localStorage
  if (res.data?.status === 'OK' && res.data?.access_token) {
    // Lưu token mới (KHÔNG dùng JSON.stringify để tránh double quote)
    const tokenToSave = res.data.access_token;
    localStorage.setItem('access_token', tokenToSave);
    console.log('Đã lưu token mới vào localStorage (không có JSON.stringify)');
    
    // Kiểm tra token đã lưu
    const savedToken = localStorage.getItem('access_token');
    try {
      const decoded = jwtDecode(savedToken);
      console.log('Token đã lưu có isAdmin:', decoded?.isAdmin);
    } catch (e) {
      console.error('Không thể decode token đã lưu:', e);
    }
  }
  
  return res.data;

};


export const logoutUser=async () => {

  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/log-out`,{},
    {withCredentials: true}
  )
  ;
  return res.data;

};

export const updateUser=async (id,dataUser,access_token) => {
  
  try {
    // LUÔN lấy token mới nhất từ localStorage (để đảm bảo dùng token mới sau khi refresh)
    let tokenToUse = access_token;
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        // Parse nếu là JSON string (trường hợp cũ)
        let parsedToken = storedToken;
        if (storedToken.startsWith('"') && storedToken.endsWith('"')) {
          parsedToken = JSON.parse(storedToken);
        }
        tokenToUse = parsedToken || access_token;
        console.log('Sử dụng token từ localStorage cho updateUser');
      } else {
        console.log('Không có token trong localStorage, dùng token từ param');
      }
    } catch (e) {
      console.error('Lỗi khi parse token từ localStorage:', e);
      // Nếu lỗi parse, dùng access_token được truyền vào
      tokenToUse = access_token;
    }
    
    // Loại bỏ dấu ngoặc kép thừa nếu có
    const cleanToken = String(tokenToUse).replace(/^"(.*)"$/, '$1').trim();
    
    // Decode để kiểm tra token
    try {
      const decoded = jwtDecode(cleanToken);
      console.log('Token sẽ được gửi trong updateUser:', { id: decoded?.id, isAdmin: decoded?.isAdmin });
    } catch (e) {
      console.error('Không thể decode token:', e);
    }
    
    const res = await axiosJwt.put(`${process.env.REACT_APP_API_URL}/user/update-user/${id}`,dataUser,{
        headers:{
        token:`Bearer ${cleanToken}`,
      }
    });
    return res.data;
  } catch (error) {
       const errResponse = error?.response?.data;
       console.error('Lỗi trong updateUser service:', errResponse);
       throw new Error(errResponse?.message || 'Lỗi cập nhật người dùng');
  }


};

export const deleteUser= async (id,access_token) =>{
  const res = await axiosJwt.delete(`${process.env.REACT_APP_API_URL}/user/delete-user/${id}`,{
      headers:{
      token:`Bearer ${access_token}`,
    }
  });
  return res.data;
}

export const deleteManyUser= async (data,access_token) =>{
  const res=  await axiosJwt.post(`${process.env.REACT_APP_API_URL}/user/delete-many`,data,{
      headers:{
      token:`Bearer ${access_token}`,
    }
  });

  
  return res.data;
}


export const sendOtp= async (email) =>{
  console.log(email)
  const res=  await axiosJwt.get(`${process.env.REACT_APP_API_URL}/forgot-password/sendOtp/${email}`)
  
  return res.data;
}

export const verifyOtp= async (data) =>{
  const res=  await axiosJwt.post(`${process.env.REACT_APP_API_URL}/forgot-password/verify-otp`,data)

  return res.data;
}

export const resetPassword= async (data,access_token) =>{
  const res=  await axiosJwt.patch(`${process.env.REACT_APP_API_URL}/forgot-password/reset-password/${data.userId}`,data,{
    headers:{
        token:`Bearer ${access_token}`,
    }
  })
  return res.data;
}

export const changePassword= async (userId,access_token,data) =>{
  const res=  await axiosJwt.post(`${process.env.REACT_APP_API_URL}/user/change-password/${userId}`,data,{
      headers:{
      token:`Bearer ${access_token}`,
    }
  });

  
  return res.data;
}
