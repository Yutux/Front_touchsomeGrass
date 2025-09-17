import React from 'react'
import request from '../../utils/request';

export default function  Updatable(props) {
    const [pseudo, setPseudo] = React.useState(props.user.pseudo);
    const [name, setName] = React.useState(props.user.name);
    const [image, setImage] = React.useState(props.user.image);

    request(`/user/update`, 'PUT', {
        pseudo: pseudo,
        name: name,
        image: image
    }, true).then((response) => {
        if (response.status === 200) {
            console.log(response.data.user)
        } else {
            console.log("Erreur lors de la connexion");
        }
    });
    
  return (
    <div>
        <form>
            <input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="file" placeholder="images" value={image} onChange={(e) => setImage(e.target.value)} />
            <button>Update</button>
        </form>
    </div>
  )
}
