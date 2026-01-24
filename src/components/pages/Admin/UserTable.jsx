import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography } from "@mui/material";

export default function UserTable() {
  const users = [
    { id: 1, name: "Alice", email: "alice@mail.com", role: "User" },
    { id: 2, name: "Bob", email: "bob@mail.com", role: "Moderator" },
    { id: 3, name: "Charlie", email: "charlie@mail.com", role: "Admin" },
  ];

  return (
    <>
      <Typography variant="h6" mb={2}>
        Gestion des utilisateurs
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Nom</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Rôle</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell align="right">
                <Button size="small" color="primary">Voir</Button>
                <Button size="small" color="warning">Éditer</Button>
                <Button size="small" color="error">Supprimer</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
