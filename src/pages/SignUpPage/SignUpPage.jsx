import React, { useEffect, useState } from 'react'
import InputFormComponent from '../../components/InputFormComponent/InputFormComponent'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { useNavigate } from 'react-router-dom'
import * as UserService from '../../services/User.Service';
import { useMutationHook } from '../../hooks/useMutationHook'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import { jwtDecode } from 'jwt-decode';
import {useDispatch} from 'react-redux'
import { updateUser } from '../../redux/slices/UserSlice'
import { setCart } from '../../redux/slices/CartSlice'
import *as CartService from "../../services/Cart.Service";
import *as FavoriteService from "../../services/Favorite.Service"
import { setFavoriteIds } from '../../redux/slices/FavoriteSlice'


const SignUpPage = () => {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const mutation=useMutationHook(
        data => UserService.signUpUser(data)
  )
  const {data,isPending,isSuccess}= mutation;

  useEffect (() => {
    const handleAutoLogin=async () =>{
      if(isSuccess&&data.status==='OK'){
        // Lưu access_token vào localStorage
        if(data?.access_token) {
          localStorage.setItem('access_token',JSON.stringify(data?.access_token))
          const decode= jwtDecode(data?.access_token);
          if(decode?.id) {
            // Lấy thông tin user, cart, favorites và tự động đăng nhập
            await handlGetDetailUser(decode.id,data?.access_token)
            await handlDetailCart(decode.id,data?.access_token)
            await handleGetUserFavorites(decode.id,data.access_token)
          }
        }
        // Chuyển về trang chủ
        navigate('/')
      }
    }
    handleAutoLogin();
  },[isSuccess, data])
  
  const handleGetUserFavorites= async(id,access_token) => {
    const res= await FavoriteService.getUserFavorite(id,access_token);
    dispatch(setFavoriteIds({total: res.total,productIds: res.data}));
  }

  const handlDetailCart = async (id, access_token) => {
    const res = await CartService.getDetail(id, access_token);
    const items = [...res.data||[]];
    dispatch(setCart({ items, total: res?.total||0 }));
  };

  const handlGetDetailUser= async (id,access_token) =>{
    const res= await UserService.getDetailUser(id,access_token);
    dispatch(updateUser({access_token,...res?.data})) 
  }
  
  const [email,setEmail] =useState('');
  const [password,setPasswrod]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  
  const handleOnchangeEmail= (value) =>{
    setEmail(value)
  }

  const handleOnchangePassword= (value) =>{
    setPasswrod(value)
  }

  const handleOnchangeConfirmPassword= (value) =>{
    setConfirmPassword(value)
  }

  const handleSignUp = () =>{
    mutation.mutate({email,password,confirmPassword})

  }



  return (
     <div className='siginPage'>
        <LoadingComponent isPending={isPending}>
          <div className='page' style={{ opacity: isPending ? 0.6 : 1, pointerEvents: isPending ? 'none' : 'auto' }}>
            <h1>Đăng ký tài khoản</h1>
            <p>Nếu bạn đã có tài khoản, đăng nhập <span onClick={() => !isPending && navigate('/sign-in')} style={{cursor: isPending ? 'not-allowed' : 'pointer',color:'#0f6ecd', opacity: isPending ? 0.6 : 1}}>tại đây</span>.</p>
            <InputFormComponent 
                className="inputAcccount" 
                placeholder="Email" 
                value={email} 
                onChange={handleOnchangeEmail}
                disabled={isPending}
            />
            <InputFormComponent 
                className="inputAcccount" 
                placeholder="Mật khẩu" 
                type={showPassword ? 'text' : 'password'}
                value={password} 
                onChange={handleOnchangePassword}
                disabled={isPending}
            />
            <InputFormComponent 
                className="inputAcccount" 
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu" 
                value={confirmPassword}
                onChange={handleOnchangeConfirmPassword}
                disabled={isPending}
            />
             <label style={{ display: 'block', marginTop: 10,marginRight:170, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
                <input
                type="checkbox"
                checked={showPassword}
                onChange={() => !isPending && setShowPassword(!showPassword)}
                disabled={isPending}
                style={{ marginRight: 8 }}
                />
                Hiện mật khẩu
            </label>
            
            {data?.status === "ERR" && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                  {data.message}
                </div>
            )}
            <ButtonComponent
                disabled={!email.length || !password.length || !confirmPassword.length || isPending}
                onClick={handleSignUp}
                styleButton={{background: '#0a4f58',fontWeight:'500',lineHeight:'10px',
                            color: '#fff',padding:'17px 10px',border:'none',borderRadius:'4px',
                            fontSize:'15px',width:'170px',margin:'16px 0 10px',
                            cursor: isPending ? 'wait' : 'pointer',
                            opacity: (!email.length || !password.length || !confirmPassword.length || isPending) ? 0.6 : 1

                }}
                textButton={isPending ? 'Đang đăng ký...' : 'Đăng ký'}
                      />
          </div>
        </LoadingComponent>

    </div>
  )
}

export default SignUpPage