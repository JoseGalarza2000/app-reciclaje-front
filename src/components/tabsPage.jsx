import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box } from '@mui/material';

export function TabsPageMui({ pages }) {
    const [value, setValue] = React.useState('recicladores');

    const handleChange = (event, newValue) => {
        console.log(newValue)
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange}>
                        {pages && pages.map((x, index) => (
                            <Tab label={x.name} value={x.value} key={index} />
                        ))}
                    </TabList>
                </Box>
                {pages && pages.map((x, index) => (
                    <TabPanel value={x.value} key={index}>{x.content}</TabPanel>
                ))}
            </TabContext>
        </Box>
    );
}

function TabsPage({ pages }) {
    const [activeTab, setActiveTab] = useState(pages ? pages[0].value : '');
    const [activeContent, setActiveContent] = useState(pages ? pages[0].content : '');

    const handleSelect = (eventKey) => {
        let arr = pages.find(x => x.value === eventKey);
        setActiveTab(eventKey);
        setActiveContent(arr.content);
    };

    return (
        <>
            <Nav fill variant="tabs" activeKey={activeTab} onSelect={handleSelect}>
                {pages && pages.map((value, index) => (
                    <Nav.Item key={index}>
                        <Nav.Link eventKey={value.value}>{value.name}</Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>
            {activeContent}
        </>
    );
}

export default TabsPage;
