import React, { useEffect, useState } from 'react'
import ProfileUser from '../../containers/ProfileUser/ProfileUser';
import Updatable from '../../containers/Updating/Updating';

import { Helmet } from 'react-helmet';

export default function Profile(props) {
    const [updatableUser, setUpdatableUser] = useState(props);
    const [wantUpdate, setWantUpdate] = useState(false);

    function handleUpdate(e) {
        e.preventDefault();
        setWantUpdate(!wantUpdate);
    }

    useEffect(() => {
        setUpdatableUser(props);
    }, [props]);

  return (
    <div>
      <Helmet>
        <style>
          {`
            body {
              background-image: url("/front-end/my-app/src/components/styles/background.jpg");
            }

          `}
        </style>
      </Helmet>
      {wantUpdate ? <Updatable user={updatableUser}/> : <ProfileUser user={updatableUser} />}
      <button className="button1" onClick={handleUpdate}>{wantUpdate ? "profile" : "update"}</button>
    </div>
  )
}
