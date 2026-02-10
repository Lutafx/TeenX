import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, DollarSign, Clock, Briefcase, ChevronRight } from 'lucide-react';

function VacanciesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === '14-16') return job.minAge <= 16;
    if (filter === '16-18') return job.minAge >= 16;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вакансий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Все вакансии</h1>
          <p className="text-gray-600 text-lg">
            Найдено {filteredJobs.length} {filteredJobs.length === 1 ? 'вакансия' : 'вакансий'}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Все вакансии
          </button>
          <button
            onClick={() => setFilter('14-16')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filter === '14-16'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            14-16 лет
          </button>
          <button
            onClick={() => setFilter('16-18')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filter === '16-18'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            16-18 лет
          </button>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold mb-2">Пока нет вакансий</h3>
            <p className="text-gray-600 mb-6">
              Новые предложения появятся совсем скоро. Подпишись на уведомления в Telegram!
            </p>
            <a
              href="https://t.me/teenx_hub_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Подписаться на бота
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <Link
                key={job.id}
                to={`/job/${job.id}`}
                className="card hover:scale-105 transition-transform duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <DollarSign size={18} className="mr-2 text-green-600" />
                    <span className="font-bold text-green-600 text-lg">
                      {job.salaryFrom && job.salaryTo 
                        ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}₸`
                        : job.salary || 'По договорённости'}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-2" />
                    <span>{job.city || 'Уральск'}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-2" />
                    <span>{job.schedule || 'График 5/2'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Возраст: {job.minAge}+ лет
                  </span>
                  <span className="text-blue-600 font-medium group-hover:underline">
                    Подробнее →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/add-vacancy" className="btn-primary inline-block">
            Разместить свою вакансию
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VacanciesPage;
