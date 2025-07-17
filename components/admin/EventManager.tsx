
import React from 'react';
import { ContentManager } from '../ContentManager';
import * as eventService from '../../services/eventService';
import { Timestamp } from 'firebase/firestore';
import { EventItem } from '../../types';

const eventApi = {
    getAll: eventService.getAllEventsForAdmin,
    create: eventService.createEvent,
    update: eventService.updateEvent,
    remove: eventService.deleteEvent,
};

const formatDate = (timestamp: Timestamp) => timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

const eventColumns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Fecha', accessor: 'date', render: (item: EventItem) => formatDate(item.date) },
    { header: 'Premium', accessor: 'isPremium', render: (item: EventItem) => item.isPremium ? 'Sí' : 'No' },
];

const EventManager: React.FC = () => {

    return (
        <ContentManager
            title="Eventos"
            itemType="event"
            api={eventApi}
            columns={eventColumns}
        />
    );
};

export default EventManager;
