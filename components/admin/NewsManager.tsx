
import React from 'react';
import { ContentManager } from '../ContentManager';
import * as newsService from '../../services/newsService';
import { NewsItem } from '../../types';

const newsApi = {
    getAll: newsService.getAllNews,
    create: newsService.createNews,
    update: newsService.updateNews,
    remove: newsService.deleteNews,
};

const newsColumns = [
    { header: 'Título', accessor: 'title' },
    { 
        header: 'Segmentación', 
        accessor: 'province', 
        render: (item: NewsItem) => `${item.province || 'Global'}${item.city ? ` > ${item.city}` : ''}` 
    },
    { header: 'Enlace', accessor: 'link', render: (item: NewsItem) => <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a> },
];

const NewsManager: React.FC = () => {

    return (
        <ContentManager
            title="Noticias"
            itemType="news"
            api={newsApi}
            columns={newsColumns}
        />
    );
};

export default NewsManager;
