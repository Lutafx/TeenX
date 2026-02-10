import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, XCircle, Eye, Clock, Users, Briefcase, AlertCircle } from 'lucide-react';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalUsers: 0,
    pendingVerifications: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPendingJobs(),
        loadPendingVerifications(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingJobs = async () => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPendingJobs(jobs);
  };

  const loadPendingVerifications = async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('verified', '==', 'pending'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPendingVerifications(users);
  };

  const loadStats = async () => {
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    const jobs = jobsSnapshot.docs.map(doc => doc.data());
    const users = usersSnapshot.docs.map(doc => doc.data());

    setStats({
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      totalUsers: users.length,
      pendingVerifications: users.filter(u => u.verified === 'pending').length
    });
  };

  const approveJob = async (jobId) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'active',
        approvedAt: new Date()
      });
      await loadData();
      alert('Вакансия одобрена и опубликована!');
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Ошибка при одобрении вакансии');
    }
  };

  const rejectJob = async (jobId) => {
    const reason = prompt('Причина отклонения (необязательно):');
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'Не указана'
      });
      await loadData();
      alert('Вакансия отклонена');
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Ошибка при отклонении вакансии');
    }
  };

  const approveVerification = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: 'yes',
        verifiedAt: new Date()
      });
      await loadData();
      alert('Верификация одобрена!');
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Ошибка при одобрении верификации');
    }
  };

  const rejectVerification = async (userId) => {
    const reason = prompt('Причина отклонения (необязательно):');
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: 'no',
        rejectedAt: new Date(),
        rejectionReason: reason || 'Не указана'
      });
      await loadData();
      alert('Верификация отклонена');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Ошибка при отклонении верификации');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Панель администратора</h1>
          <p className="text-gray-600 text-lg">Управление вакансиями и верификацией пользователей</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Всего вакансий</p>
                <p className="text-3xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase size={48} className="opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Активные</p>
                <p className="text-3xl font-bold">{stats.activeJobs}</p>
              </div>
              <CheckCircle size={48} className="opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 mb-1">На модерации</p>
                <p className="text-3xl font-bold">{stats.pendingJobs}</p>
              </div>
              <Clock size={48} className="opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">Пользователи</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users size={48} className="opacity-20" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Вакансии на модерации ({pendingJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'verifications'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Верификации ({pendingVerifications.length})
          </button>
        </div>

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {pendingJobs.length === 0 ? (
              <div className="card text-center py-12">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                <h3 className="text-2xl font-bold mb-2">Нет вакансий на модерации</h3>
                <p className="text-gray-600">Все вакансии проверены!</p>
              </div>
            ) : (
              pendingJobs.map(job => (
                <div key={job.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                      <p className="text-gray-600 mb-2">
                        <strong>Компания:</strong> {job.companyName}
                      </p>
                      <p className="text-gray-600">
                        <strong>Город:</strong> {job.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {job.salaryFrom?.toLocaleString()} - {job.salaryTo?.toLocaleString()}₸
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.createdAt?.toDate()).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">График</p>
                      <p className="font-semibold">{job.schedule}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Занятость</p>
                      <p className="font-semibold">{job.employmentType}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Формат</p>
                      <p className="font-semibold">{job.workFormat}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Возраст</p>
                      <p className="font-semibold">{job.minAge}+ лет</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-bold mb-2">О компании:</h4>
                    <p className="text-gray-700 whitespace-pre-line mb-4">{job.companyDescription}</p>
                    
                    <h4 className="font-bold mb-2">Обязанности:</h4>
                    <p className="text-gray-700 whitespace-pre-line mb-4">{job.responsibilities}</p>
                    
                    <h4 className="font-bold mb-2">Требования:</h4>
                    <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-bold mb-2">Контакты:</h4>
                    <p className="text-gray-700">
                      <strong>Имя:</strong> {job.contactName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Телефон:</strong> {job.contactPhone}
                    </p>
                    {job.contactEmail && (
                      <p className="text-gray-700">
                        <strong>Email:</strong> {job.contactEmail}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => approveJob(job.id)}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <CheckCircle className="mr-2" size={20} />
                      Одобрить
                    </button>
                    <button
                      onClick={() => rejectJob(job.id)}
                      className="flex-1 btn-cancel flex items-center justify-center"
                    >
                      <XCircle className="mr-2" size={20} />
                      Отклонить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="space-y-6">
            {pendingVerifications.length === 0 ? (
              <div className="card text-center py-12">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                <h3 className="text-2xl font-bold mb-2">Нет верификаций на проверке</h3>
                <p className="text-gray-600">Все запросы обработаны!</p>
              </div>
            ) : (
              pendingVerifications.map(user => (
                <div key={user.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{user.name || 'Имя не указано'}</h3>
                      <p className="text-gray-600">
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p className="text-gray-600">
                        <strong>Тип:</strong> {user.type === 'teen' ? 'Подросток' : 'Работодатель'}
                      </p>
                      <p className="text-gray-600">
                        <strong>Возраст:</strong> {user.age || 'Не указан'}
                      </p>
                    </div>
                  </div>

                  {user.docUrl && (
                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Документ:</h4>
                      <img 
                        src={user.docUrl} 
                        alt="Документ пользователя" 
                        className="max-w-md rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
                      <p className="text-sm text-yellow-800">
                        Проверьте документы пользователя перед одобрением. Убедитесь, что возраст соответствует требованиям.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => approveVerification(user.id)}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <CheckCircle className="mr-2" size={20} />
                      Одобрить
                    </button>
                    <button
                      onClick={() => rejectVerification(user.id)}
                      className="flex-1 btn-cancel flex items-center justify-center"
                    >
                      <XCircle className="mr-2" size={20} />
                      Отклонить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
