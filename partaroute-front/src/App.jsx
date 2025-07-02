import AppRouter from "./routes/AppRouter";
import TripForm from "./components/TripForm";
import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Le layout (centrage, fond, etc.) doit être géré dans chaque page ou via un layout global.
function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppRouter onOpenCreateTrip={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          Nouveau trajet
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TripForm
            onTripCreated={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
