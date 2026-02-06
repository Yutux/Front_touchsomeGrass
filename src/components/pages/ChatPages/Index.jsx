import React from 'react';
import { Box, Grid, Container } from '@mui/material';
import ConversationList from '../../Chat/ConversationList';
import ChatWindow from '../../Chat/ChatWindow';

export default function ChatPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 100px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Liste des conversations */}
        <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
          <ConversationList />
        </Grid>

        {/* Fenêtre de chat */}
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
          <ChatWindow />
        </Grid>
      </Grid>
    </Container>
  );
}