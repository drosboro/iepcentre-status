import React, { useEffect, useState, useCallback } from 'react'
import { Box, Typography, Button, FormControlLabel, Switch } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline';
import DownIcon from '@mui/icons-material/Cancel'
import UpIcon from '@mui/icons-material/CheckCircle'
import UnknownIcon from '@mui/icons-material/DoNotDisturbOn'
import { red, grey } from '@mui/material/colors';

import axios from 'axios'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [healthData, setHealthData] = useState({ db: "", pdf_queue: 0, query: "", redis: "", thumb_queue: 0, uptime: "0s" })
  const [apiState, setApiState] = useState("")
  const [polling, setPolling] = useState(false)

  const doPolling = useCallback(() => {
    if (polling) {
      updateHealthData()
    }
  }, [polling])
  
  useEffect(() => {
    const interval = setInterval(() => {
      doPolling()
    }, 10000)
    updateHealthData()
    return () => clearInterval(interval)
  }, [doPolling])



  function updateHealthData() {
    axios.get("https://api.iepcentre.com/healthcheck", { headers:  { 'Content-Type': 'application/json' }}).then((response) => {
      setHealthData(response.data)
      setApiState("up")
    }).catch((error) => {
      setHealthData({ db: "", pdf_queue: 0, query: "", redis: "", thumb_queue: 0, uptime: "0s" })
      setApiState("down")
    })
  }

  function handlePollingChange(e) {
    setPolling(e.target.checked)
  }

  function iconForStatus(status) {
    if (status === "") {
      return null
    } else if (status === "up") {
      return <UpIcon color="success" fontSize="large" />
    } else if (status === "down") {
      return <DownIcon sx={{ color: red[600] }}  fontSize="large" />
    } else {
      return <UnknownIcon color="disabled" fontSize="large" />
    }
  }

  function humanUptime(uptime) {
    return uptime.replace(/\.\d+/g, "")
  }

  function humanTime() {
    return new Date().toLocaleString()

  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <Box sx={{ 
            width: "100%",
            maxWidth: "400px",
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "start",
            mt: 8,
            mx: 2
          }}>
            <Box sx={{ maxHeight: "100px", width: "100%" }} component="img" src="logo_sm.svg" />
            <Typography sx={{ mt: 2 }} variant="h4">App Status</Typography>
            <Typography sx={{ mb: 4, color: grey[700] }} variant="h6">as of { humanTime() }</Typography>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">API</Typography>
              { iconForStatus(apiState) }
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">Database</Typography>
              { iconForStatus(healthData.db) }
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">Query</Typography>
              { iconForStatus(healthData.query) }
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">Cache</Typography>
              { iconForStatus(healthData.redis) }
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">Uptime</Typography>
              <Typography variant="h5" sx={{ color: grey[700] }}>{ humanUptime(healthData.uptime) }</Typography>
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Typography sx={{ flexGrow: 1 }} variant="h5">Queued Jobs</Typography>
              <Typography variant="h5" sx={{ color: grey[700] }}>{ healthData.pdf_queue + healthData.thumb_queue }</Typography>
            </Box>
            <Box sx={{ width: "100%", display: "flex", my: 1 }}>
              <Box sx={{ mt: 4, flexGrow: 1 }}>
                <Button variant="outlined" onClick={updateHealthData}>Refresh Now</Button>
              </Box>
              <Box sx={{ mt: 4 }}>
                <FormControlLabel sx={{ color: grey[700] }} value={polling} label="Live Poll" labelPlacement="start" control={<Switch checked={polling} color="primary" onChange={handlePollingChange} />}></FormControlLabel>
              </Box>
            </Box>
          </Box>
        </Box>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
