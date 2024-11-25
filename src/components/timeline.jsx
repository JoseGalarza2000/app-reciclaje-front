import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

export default function CustomizedTimeline({ timelimeObject }) {
    return (
        <div className='mb-3'>
            {
                (timelimeObject && timelimeObject.childs.length > 0) ? (
                    <>
                        <Timeline position="alternate">
                            {timelimeObject.childs.map(value => (
                                <TimelineItem key={value.id}>
                                    <TimelineSeparator>
                                        <TimelineConnector sx={{ minHeight: '15px' }} />
                                        <TimelineDot color="primary" style={{ width: "3rem", height: "3rem" }}>
                                            <div className="d-flex justify-content-center align-items-center center-box w-100">
                                                <h3 className="text-center m-0">{value.numero}</h3>
                                            </div>
                                        </TimelineDot>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                                        <h5 className="m-0">{value.title}</h5>
                                        <p className="m-0">{value.content}</p>
                                    </TimelineContent>
                                </TimelineItem>
                            ))
                            }
                        </Timeline>
                    </>
                ) : (
                    <></>
                )
            }

        </div>
    );
}
