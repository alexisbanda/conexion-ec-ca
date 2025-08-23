
import React, { useContext } from 'react';
import { ContentManager } from '../ContentManager';
import * as newsService from '../../services/newsService';
import { NewsItem } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';

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
    const auth = useContext(AuthContext);

    const queryFilter = auth?.user?.role === 'regional_admin' && auth.user.managedProvince
        ? { province: auth.user.managedProvince }
        : undefined;

    return (
        <ContentManager
            title="Noticias"
            itemType="news"
            api={newsApi}
            columns={newsColumns}
            queryFilter={queryFilter}
        />
    );
};

export default NewsManager;
