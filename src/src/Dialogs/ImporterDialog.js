import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {
    Checkbox,
    DialogTitle, FormControl, IconButton, InputLabel, makeStyles,
    MenuItem,
    Select,
    TextField,
    // TextField, 
    ThemeProvider,
    Tooltip
} from '@material-ui/core';

import IconClose from '@material-ui/icons/Close';
import IconCheck from '@material-ui/icons/Check';

import I18n from '@iobroker/adapter-react/i18n';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import TypeIcon from '../Components/TypeIcon';
import { MdModeEdit as IconEdit } from 'react-icons/md';
import clsx from 'clsx';
import TreeView from '../Components/TreeView';
// import UploadImage from '../Components/UploadImage';
import Icon from '@iobroker/adapter-react/Components/Icon';

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
        maxHeight: 'calc(100% - 64px)',
        width: '100%'
    },
    overflowHidden: {
        display: 'flex',
        overflow: 'hidden'
    },
    pre: {
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        margin: 0
    },
    divOids: {
        display: 'flex',
        width: '100%',
    },
    divOidField: {
        width: '100%',
        display: 'block',
        paddingTop: 7,
        paddingBottom: 7,
    },

    oidName: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    flex: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    type: {
        width: '100%',
    },
    deviceWrapper: {
        display: 'flex',
        flexDirection: 'column',
        padding: 4,
        margin: '2px 10px'
    },
    fontStyle: {
        padding: '0px 8px',
        overflow: 'hidden',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    fontStyleId: {
        padding: '0px 8px',
        overflow: 'hidden',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        opacity: 0.6,
        fontSize: 9,
        fontStyle: 'italic'
    },
    wrapperTitleAndId: {
        alignSelf: 'center'
    },
    tableIcon: {
        margin: 'auto 0'
    },
    tableIconImg: {
        width: 20,
        height: 20
    },
    header: {
        display: 'flex',
        background: '#00000057',
        margin: 10,
        padding: 4,
        borderRadius: 4,
        marginBottom: 10
    },
    wrapperDevices: {
        margin: '0 10px'
    },
    wrapperItems: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
    },
    wrapperCloning: {
        backgroundColor: '#FFFFFF10',
        borderRadius: 3
    },
    wrapperNameAndId: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%'
    },
    wrapperCheckbox: {
        display: 'flex',
    },
    enumsWrapper: {
        display: 'flex',
    },
    wrapperIconEnumCell: {
        display: 'flex',
        alignItems: 'center',
        margin: '0 4px'
    },
    enumIcon: {
        width: 20,
        height: 20
    },
    nameEnumCell: {
        fontSize: 10,
        opacity: 0.7,
        marginLeft: 4
    },
    backgroundRed: {
        background: '#ff000029',
        borderRadius: 4
    },
    dialogNewForm: {
        margin: 10
    }
}));


const RenderNewItemDialog = ({ classes, objects, object, onClose, open, checkDeviceInObjects }) => {
    const [name, setName] = useState(object.title);
    const error = !name || (object && checkDeviceInObjects(name, object.id));
    useEffect(() => {
        if (object && name !== object.title) {
            setName(object.title)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [object])
    return (
        <Dialog
            key="newDialog"
            onClose={onClose}
            open={open}>
            <DialogTitle className={classes.addNewFolderTitle} >{I18n.t('Edit name "%s"', name)}</DialogTitle>
            <div className={classes.dialogNewForm} noValidate autoComplete="off">
                <TextField
                    onKeyPress={(ev) => {
                        if (ev.key === 'Enter') {
                            // if (this.state.addNewName) {
                            //     const id = this.state.selected;
                            //     onAddNew(this.state.addNewName, this.state.addNew.id,
                            //         () => {
                            //             this.toggleExpanded(id, true);
                            //             this.setState({ addNew: null, addNewName: '' })
                            //         })
                            // } else {
                            //     this.setState({ addNew: null, addNewName: '' })
                            // }
                            ev.preventDefault();
                        }
                    }}
                    error={!!error}
                    className={classes.dialogNewInput}
                    autoFocus
                    fullWidth
                    label={I18n.t('Name')}
                    value={name}
                    onChange={e => setName(e.target.value)} />
            </div>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={!!error}
                    onClick={() => {
                        onClose(name);
                    }}
                    startIcon={<IconCheck />}
                    color="primary">{I18n.t('Edit')}</Button>
                <Button
                    variant="contained"
                    onClick={onClose}
                    startIcon={<IconClose />}
                >{I18n.t('Cancel')}</Button>
            </DialogActions>
        </Dialog>);
}


const ImporterDialog = ({
    onClose,
    item,
    socket,
    devices,
    objects,
    listItems
}) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [arrayDevice, setArrayDevice] = useState([]);
    const [cloningMethod, setCloningMethod] = useState('flat');
    const [idsFolder, setSdsFolder] = useState([]);
    const [selectFolder, setSelectFolder] = useState('alias.0');
    const [checkedSelect, setCheckedSelect] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(() => {

        const ids = [];
        const getParentId = (id) => {
            const pos = id.lastIndexOf('.');
            if (pos !== -1) {
                return id.substring(0, pos);
            } else {
                return '';
            }
        }

        const getLastPart = (id) => {
            const pos = id.lastIndexOf('.');
            if (pos !== -1) {
                return id.substring(pos + 1);
            } else {
                return id;
            }
        }

        const prefix = 'alias.0'
        Object.keys(objects).forEach(id => {
            if (id.startsWith(prefix) &&
                objects[id] &&
                objects[id].common &&
                (objects[id].type === 'channel' || objects[id].type === 'device' || objects[id].type === 'folder')) {
                let parentId;
                // getParentId
                if (objects[id].type === 'folder') {
                    parentId = id;
                } else {
                    parentId = getParentId(id);
                }

                if (parentId && !ids.includes(parentId)) {
                    ids.push(parentId);
                }
            }
        });

        const stateIds = {};
        const language = I18n.getLanguage();
        ids.forEach(id => stateIds[id] = {
            common: {
                name: objects[id] && objects[id].type === 'folder' ? Utils.getObjectName(objects, id, { language }) : getLastPart(id),
                nondeletable: true,
                color: objects[id]?.common && objects[id].common.color ? objects[id].common.color : null,
                icon: objects[id]?.common && objects[id].common.icon ? objects[id].common.icon : null
            },
            type: 'folder'
        });

        stateIds[prefix] = {
            common: {
                name: I18n.t('Root'),
                nondeletable: true
            },
            type: 'folder'
        };
        setSdsFolder(stateIds);
    }, [objects])


    useEffect(() => {
        const newArray = listItems.filter(device => device.parent === item.id);
        setArrayDevice(newArray);
        const selectId = newArray.map(device => device.id);
        setCheckedSelect(selectId);
    }, [item.id, item.parent, listItems]);

    const onCloseModal = (bool) => {
        setOpen(false);
        onClose(bool);
        if (node) {
            document.body.removeChild(node);
            node = null;
        }
    };



    const addToEnum = (enumId, id) => {
        socket.getObject(enumId)
            .then(obj => {
                if (obj && obj.common) {
                    obj.common.members = obj.common.members || [];

                    if (!obj.common.members.includes(id)) {
                        obj.common.members.push(id);
                        obj.common.members.sort();
                        objects[enumId] = obj;
                        return socket.setObject(enumId, obj);
                    }
                }
            });
    }

    const processTasks = (tasks, cb) => {
        if (!tasks || !tasks.length) {
            cb && cb();
        } else {
            const task = tasks.shift();
            let promises = [];

            if (task.enums) {
                promises = task.enums.map(enumId => addToEnum(enumId, task.id))
            }
            objects[task.id] = task.obj;
            promises.push(socket.setObject(task.id, task.obj));

            Promise.all(promises)
                .then(() => setTimeout(() =>
                    processTasks(tasks, cb), 0));
        }
    }

    const onCopyDevice = (copyDevice, newChannelId, originalId, cb) => {
        if (!copyDevice) {
            return null
        }
        // if this is device not from linkeddevice or from alias
        const channelId = copyDevice.channelId;
        const isAlias = channelId.startsWith('alias.') || channelId.startsWith('linkeddevices.');

        const channelObj = objects[channelId];
        const { functions, rooms, icon, states, color } = copyDevice;
        const tasks = [];

        tasks.push({
            id: newChannelId,
            obj: {
                common: {
                    name: channelObj.common.name,
                    color: color,
                    desc: channelObj.common.desc,
                    role: channelObj.common.role,
                    icon: icon && icon.startsWith('adapter/') ? `../../${icon}` : icon,
                },
                native: {
                    originalId
                },
                type: 'channel'
            },
            enums: rooms.concat(functions)
        });
        console.log(2222233444, tasks)
        states.forEach(state => {
            if (!state.id) {
                return;
            }
            const obj = JSON.parse(JSON.stringify(objects[state.id]));
            obj._id = newChannelId + '.' + state.name;

            obj.native = {};
            if (!isAlias) {
                obj.common.alias = { id: state.id };
            }
            tasks.push({ id: obj._id, obj });
        });
        return new Promise((resolve) => {
            processTasks(tasks, () => {
                resolve();
                cb();
            });
        })
    }

    const addNewFolder = async (dataFolder, id, cb) => {
        const obj = {
            _id: id,
            common: {
                name: dataFolder.objName ? dataFolder.objName : { [I18n.getLanguage()]: dataFolder.name },
                color: dataFolder.color,
                icon: dataFolder.icon
            },
            native: {},
            type: 'folder'
        };

        objects[obj._id] = obj;
        await socket.setObject(id, obj).then(() => {
            cb && cb()
        });
    }

    const onChangeCopy = () => {
        const arrayDeviceFunction = () => {
            arrayDevice.forEach(async el => {
                if (checkedSelect.indexOf(el.id) === -1 && checkDeviceInObjects(el.title, el.id)) {
                    return;
                }
                const addDevice = async (id, cb) => {
                    const newId = `${id}.${el.title.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_')}`
                    await onCopyDevice(device, newId, el.id, () => {
                        cb && cb();
                    });
                }
                let newId = `${selectFolder}`;
                const device = devices.find(device => el.id === device.channelId);
                if (cloningMethod === 'rooms') {
                    if (device.rooms.length) {
                        newId = `${newId}.${device.rooms[0].replace('enum.rooms.', '')}`;
                        if (!objects[newId]) {
                            const newObjFolder = objects[device.rooms[0]];
                            addNewFolder({
                                objName: newObjFolder.common.name,
                                color: newObjFolder.common.color,
                                icon: newObjFolder.common.icon
                            }, newId, () => addDevice(newId));
                        } else {
                            addDevice(newId);
                        }
                    }
                } else if (cloningMethod === 'functions') {
                    if (device.functions.length) {
                        newId = `${newId}.${device.functions[0].replace('enum.functions.', '')}`;
                        if (!objects[newId]) {
                            const newObjFolder = objects[device.functions[0]];
                            addNewFolder({
                                objName: newObjFolder.common.name,
                                color: newObjFolder.common.color,
                                icon: newObjFolder.common.icon
                            }, newId, () => addDevice(newId));
                        } else {
                            addDevice(newId);
                        }
                    }
                } else {
                    addDevice(newId);
                }
            })
        }

        if (!objects[selectFolder]) {
            let parts = selectFolder.split('.');
            parts = parts.pop();
            addNewFolder({
                name: parts.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_'),
                color: null,
                icon: null
            }, selectFolder, () => arrayDeviceFunction())
        } else {
            arrayDeviceFunction();
        }
        return onCloseModal(true);
    }

    const generateFolders = () => {
        switch (cloningMethod) {
            case 'flat':
                return ''
            case 'rooms':
                return `.{${I18n.t('rooms')}}`
            case 'functions':
                return `.{${I18n.t('functions')}}`
            default:
                return ''
        }
    }

    const renderEnumCell = (id, name) => {
        const device = devices.find(device => id === device.channelId);
        if (!device[name]) {
            return null;
        }
        return device[name].map(id => ({
            icon: Utils.getObjectIcon(id, objects[id]),
            name: Utils.getObjectName(objects, id, { language: I18n.getLanguage() }),
            id
        })).map(obj => <div className={classes.wrapperIconEnumCell} key={obj.id}>
            {obj.icon && <Icon className={classes.enumIcon} src={obj.icon} alt={obj.id} />}
            <div className={classes.nameEnumCell}>{obj.name}</div>
        </div>);
    }

    const checkDeviceInObjects = (name, id) => {
        const device = devices.find(device => id === device.channelId);
        let newId = `${selectFolder}.${name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_')}`;
        if (cloningMethod === 'rooms') {
            if (device.rooms.length) {
                newId = `${selectFolder}.${device.rooms[0].replace('enum.rooms.', '')}.${name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_')}`;
            }
        } else if (cloningMethod === 'functions') {
            if (device.functions.length) {
                newId = `${selectFolder}.${device.functions[0].replace('enum.functions.', '')}.${name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_')}`;
            }
        }
        return !!objects[newId];
    }

    return <ThemeProvider theme={theme(Utils.getThemeName())}>
        <Dialog
            onClose={onCloseModal}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <DialogTitle>{I18n.t('Importer  %s', item.title)} ---> {selectFolder}{generateFolders()}</DialogTitle>
            <DialogContent className={classes.overflowHidden} dividers>
                <RenderNewItemDialog
                    classes={classes}
                    objects={objects}
                    object={openEdit}
                    checkDeviceInObjects={checkDeviceInObjects}
                    onClose={bool => {
                        setOpenEdit(false);
                    }}
                    open={openEdit} />
                <div className={classes.divOids}>
                    <div className={clsx(classes.flex, classes.wrapperDevices)}>
                        <TreeView
                            themeType={Utils.getThemeType()}
                            theme={theme(Utils.getThemeName())}
                            objects={idsFolder}
                            onAddNew={(name, parentId, cb) => addNewFolder(name, parentId, cb)}
                            onSelect={id => setSelectFolder(id)}
                            selected={selectFolder}
                            displayFlex
                        />
                    </div>
                    <div className={clsx(classes.flex, classes.wrapperCloning)}>
                        <div className={classes.header}>
                            <Checkbox
                                checked={arrayDevice.length === checkedSelect.length || ((arrayDevice.length !== checkedSelect.length) && checkedSelect.length !== 0)}
                                indeterminate={(arrayDevice.length !== checkedSelect.length) && checkedSelect.length !== 0}
                                onChange={() => {
                                    if (arrayDevice.length === checkedSelect.length) {
                                        setCheckedSelect([]);
                                    } else {
                                        const selectId = arrayDevice.map(device => device.id);
                                        setCheckedSelect(selectId);
                                    }
                                }}
                            />
                            <FormControl className={classes.type}>
                                <InputLabel>{I18n.t('cloning method')}</InputLabel>
                                <Select
                                    className={classes.oidField}
                                    fullWidth
                                    value={cloningMethod}
                                    onChange={e => {
                                        setCloningMethod(e.target.value);
                                    }}
                                >
                                    <MenuItem value={'flat'}>
                                        {I18n.t('flat')}
                                    </MenuItem>
                                    <MenuItem value={'rooms'}>
                                        {I18n.t('rooms')}
                                    </MenuItem>
                                    <MenuItem value={'functions'}>
                                        {I18n.t('functions')}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className={classes.wrapperItems}>
                            {arrayDevice.map(device => <div className={clsx(classes.deviceWrapper, checkDeviceInObjects(device.title, device.id) && classes.backgroundRed)} key={device.id}>
                                <div className={classes.wrapperNameAndId}>
                                    <div className={classes.wrapperCheckbox}>
                                        <Checkbox
                                            disabled={checkDeviceInObjects(device.title, device.id)}
                                            checked={checkedSelect.indexOf(device.id) !== -1}
                                            onChange={() => {
                                                const newArray = JSON.parse(JSON.stringify(checkedSelect));
                                                const indexCurrent = checkedSelect.indexOf(device.id);
                                                if (indexCurrent !== -1) {
                                                    newArray.splice(indexCurrent, 1);
                                                    setCheckedSelect(newArray);
                                                } else {
                                                    newArray.push(device.id);
                                                    setCheckedSelect(newArray);
                                                }
                                            }}
                                        />
                                        <div className={classes.tableIcon}>
                                            <TypeIcon src={device.icon} className={classes.tableIconImg} type={device.role} />
                                        </div>
                                        <div className={classes.wrapperTitleAndId}>
                                            <div className={classes.fontStyle}>
                                                {device.title}
                                            </div>
                                            <div className={classes.fontStyleId}>
                                                {device.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Tooltip title={I18n.t('Edit folder')}>
                                            <IconButton
                                                onClick={() => setOpenEdit(device)}
                                            >
                                                <IconEdit />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className={classes.enumsWrapper}>
                                    {renderEnumCell(device.id, 'functions')}
                                    {renderEnumCell(device.id, 'rooms')}
                                    {/* {checkDeviceInObjects(device.title, device.id)} */}
                                </div>
                            </div>)}
                        </div>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    autoFocus
                    disabled={!checkedSelect.length}
                    onClick={() => {
                        // onCloseModal();
                        onChangeCopy();
                    }}
                    startIcon={<IconCheck />}
                    color="primary">
                    {I18n.t('Write')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onCloseModal();
                    }}
                    startIcon={<IconClose />}
                    color="default">
                    {I18n.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

export const importerCallBack = (
    onClose,
    item,
    socket,
    devices,
    objects,
    listItems
) => {
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
    }

    return ReactDOM.render(<ImporterDialog
        item={item}
        socket={socket}
        devices={devices}
        objects={objects}
        onClose={onClose}
        listItems={listItems}
    />, node);
}
// export default ImporterDialog;