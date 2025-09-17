import React from 'react'
import { useState } from 'react';
import request from '../../utils/request';
import { Navigate } from 'react-router-dom';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBBtn } from 'mdb-react-ui-kit';
import { Helmet } from 'react-helmet';



export default function ProfileUser(props) {
  const[user, setUser] = useState(null);
  const[lastname, setLastname] = useState([]);
  const[email, setEmail] = useState([]);




  var token = localStorage.getItem("token")
  
  function  logOut(e){
    e.preventDefault();
    localStorage.clear();
    window.location.reload(true);
  }

  if(user == null){
    request(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/user?token=${token}`, 'GET', true)
        .then((response) => {
			if (response.status === 200) {
                setLastname(response.data.userApp.lastname)
                setEmail(response.data.userApp.email)
                setUser(response.data.userApp)
            }else
              return <Navigate to={"/"}/>
        })
      }
  return (
   
    <div className="vh-100" style={{ backgroundColor: '#9de2ff' }}>
      <MDBContainer>
        <MDBRow className="justify-content-center">
          <MDBCol md="9" lg="7" xl="5" className="mt-5">
            <MDBCard style={{ borderRadius: '15px' }}>
              <MDBCardBody className="p-4">
                <div className="d-flex text-black">
                  <div className="flex-shrink-0">
                    <MDBCardImage
                      style={{ width: '180px', borderRadius: '10px' }}
                      src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp'
                      alt='Generic placeholder image'
                      fluid />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <MDBCardTitle>{lastname}</MDBCardTitle>
                    <MDBCardText>{email}</MDBCardText>

                    {/* <div className="d-flex justify-content-start rounded-3 p-2 mb-2"
                      style={{ backgroundColor: '#efefef' }}>
                      <div>
                        <p className="small text-muted mb-1">Articles</p>
                        <p className="mb-0">41</p>
                      </div>
                      <div className="px-3">
                        <p className="small text-muted mb-1">Followers</p>
                        <p className="mb-0">976</p>
                      </div>
                      <div>
                        <p className="small text-muted mb-1">Rating</p>
                        <p className="mb-0">8.5</p>
                      </div>
                    </div> */}
                    <div className="d-flex pt-1 justify-content-around">
                      <MDBBtn outline className="me-1 flex-grow-1 button1">Chat</MDBBtn>
                      <MDBBtn className="flex-grow-1 button1">Follow</MDBBtn>
                      <MDBBtn onClick={logOut} className="flex-grow-1 button1">logout</MDBBtn>
                    </div>
                    
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  )
}
