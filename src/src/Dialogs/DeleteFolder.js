import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Checkbox, DialogTitle, FormControlLabel, makeStyles, ThemeProvider } from '@material-ui/core';

import IconClose from '@material-ui/icons/Close';
import IconCheck from '@material-ui/icons/Check';

import I18n from '@iobroker/adapter-react/i18n';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';

let node = null;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: 'auto',
        display: 'flex'
    },
    paper: {
        maxWidth: 960,
        width: 'calc(100% - 64px)'
    },
    overflowHidden: {
        display: 'flex',
        flexDirection: 'column',
        border: 'none'
        // overflow: 'hidden'
    },
    pre: {
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        margin: 0
    },
    showDialog: {
        marginTop: 10
    }
}));

const DeleteFolder = ({ cb, device }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [checked, setChecked] = useState(false);

    const onClose = () => {
        setOpen(false);
        if (node) {
            document.body.removeChild(node);
            node = null;
        }
    };

    return <ThemeProvider theme={theme(Utils.getThemeName())}>
        <Dialog
            onClose={onClose}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <DialogTitle>{I18n.t('Please confirm...')}</DialogTitle>
            <DialogContent className={classes.overflowHidden} dividers>
                {I18n.t(device ? 'Device and all states will be deleted. Are you sure?' : 'Folder will be deleted. Are you sure?')}
                <div className={classes.showDialog}>
                    <FormControlLabel
                        control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} />}
                        label={I18n.t('Do not show dialog for 5 minutes')}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    autoFocus
                    onClick={() => {
                        onClose();
                        if (checked) {
                            window.localStorage.setItem(device ? 'DeleteDeviceTime' : 'DeleteFolderTime', new Date().getTime());
                        }
                        cb(true);
                    }}
                    startIcon={<IconCheck />}
                    color="primary">
                    {I18n.t('Delete')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onClose();
                        cb(false);
                    }}
                    startIcon={<IconClose />}
                    color="default">
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

export const deleteFolderAndDeviceCallBack = (cb, device = false) => {
    const time = window.localStorage.getItem(device ? 'DeleteDeviceTime' : 'DeleteFolderTime');
    const fiveMin = 1000 * 60 * 5;
    if (time && new Date().getTime() - time < fiveMin) {
        return cb(true);
    }
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
    }
    return ReactDOM.render(<DeleteFolder cb={cb} device={device} />, node);
}