import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";

export default function HomeCard({ ville, heure }) {
  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden", position: "relative" }}>
      <CardMedia
        component="img"
        height="140"
        image={`https://source.unsplash.com/featured/?${ville}`}
        alt={ville}
      />
      <CardContent
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "8px 12px",
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2">{ville}</Typography>
          <Typography variant="caption">📍 {heure}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
