import React, { useState } from 'react';
import { FileText, Download, AlertCircle, CheckCircle2, Info } from 'lucide-react';

function DocumentsPage() {
  const [selectedAge, setSelectedAge] = useState('14-16');

  const documents14_16 = [
    {
      title: 'Трудовой договор для подростков 14-16 лет',
      description: 'Стандартный трудовой договор с учётом требований ТК РК для несовершеннолетних',
      required: true
    },
    {
      title: 'Согласие родителей на работу',
      description: 'Обязательное письменное согласие одного из родителей или законного представителя',
      required: true
    },
    {
      title: 'Медицинская справка формы 086/у',
      description: 'Обязательный медицинский осмотр перед приёмом на работу',
      required: true
    },
    {
      title: 'Копия свидетельства о рождении или паспорта',
      description: 'Документ, удостоверяющий личность и возраст',
      required: true
    }
  ];

  const documents16_18 = [
    {
      title: 'Трудовой договор для подростков 16-18 лет',
      description: 'Стандартный трудовой договор с учётом требований ТК РК для несовершеннолетних',
      required: true
    },
    {
      title: 'Медицинская справка формы 086/у',
      description: 'Обязательный медицинский осмотр перед приёмом на работу',
      required: true
    },
    {
      title: 'Копия паспорта',
      description: 'Документ, удостоверяющий личность',
      required: true
    },
    {
      title: 'ИИН (Индивидуальный идентификационный номер)',
      description: 'Необходим для оформления в налоговой',
      required: true
    }
  ];

  const currentDocuments = selectedAge === '14-16' ? documents14_16 : documents16_18;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Документы для оформления</h1>
          <p className="text-gray-600 text-lg">
            Всё необходимое для легального трудоустройства подростков в Казахстане
          </p>
        </div>

        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setSelectedAge('14-16')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              selectedAge === '14-16'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            14-16 лет
          </button>
          <button
            onClick={() => setSelectedAge('16-18')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              selectedAge === '16-18'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            16-18 лет
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">
                Необходимые документы для {selectedAge} лет
              </h2>
              <div className="space-y-4">
                {currentDocuments.map((doc, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="text-blue-600 mr-2" size={20} />
                          <h3 className="font-bold text-lg">{doc.title}</h3>
                          {doc.required && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              Обязательно
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{doc.description}</p>
                      </div>
                      <button className="ml-4 text-blue-600 hover:text-blue-700">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAge === '14-16' && (
              <div className="card bg-yellow-50 border-2 border-yellow-300">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-2">
                      Особые требования для 14-16 лет
                    </h3>
                    <ul className="text-yellow-800 space-y-2 text-sm">
                      <li>• <strong>Согласие родителей обязательно</strong> - один из родителей должен подписать согласие</li>
                      <li>• <strong>Максимум 24 часа в неделю</strong> - это законодательное ограничение</li>
                      <li>• <strong>Запрещена работа с 22:00 до 06:00</strong> - ночные смены недопустимы</li>
                      <li>• <strong>Только лёгкий труд</strong> - работа не должна вредить здоровью и учёбе</li>
                      <li>• <strong>Медосмотр обязателен</strong> - перед началом работы и ежегодно</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedAge === '16-18' && (
              <div className="card bg-blue-50 border-2 border-blue-300">
                <div className="flex items-start">
                  <Info className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">
                      Особые требования для 16-18 лет
                    </h3>
                    <ul className="text-blue-800 space-y-2 text-sm">
                      <li>• <strong>Согласие родителей не требуется</strong> - можете устроиться самостоятельно</li>
                      <li>• <strong>Максимум 36 часов в неделю</strong> - это законодательное ограничение</li>
                      <li>• <strong>Запрещена работа с 22:00 до 06:00</strong> - ночные смены недопустимы</li>
                      <li>• <strong>Ежегодный отпуск 31 день</strong> - больше, чем у взрослых</li>
                      <li>• <strong>Медосмотр обязателен</strong> - перед началом работы и ежегодно</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Шаблоны документов</h2>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="text-blue-600 mr-3" size={24} />
                    <div>
                      <p className="font-semibold">Трудовой договор ({selectedAge} лет)</p>
                      <p className="text-sm text-gray-600">Готовый шаблон для заполнения</p>
                    </div>
                  </div>
                  <Download className="text-blue-600" size={20} />
                </a>

                {selectedAge === '14-16' && (
                  <a
                    href="#"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="text-blue-600 mr-3" size={24} />
                      <div>
                        <p className="font-semibold">Согласие родителей</p>
                        <p className="text-sm text-gray-600">Шаблон согласия для родителей</p>
                      </div>
                    </div>
                    <Download className="text-blue-600" size={20} />
                  </a>
                )}

                <a
                  href="#"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="text-blue-600 mr-3" size={24} />
                    <div>
                      <p className="font-semibold">Заявление о приёме на работу</p>
                      <p className="text-sm text-gray-600">Стандартное заявление</p>
                    </div>
                  </div>
                  <Download className="text-blue-600" size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <h3 className="text-xl font-bold mb-4">Нужна помощь?</h3>
              <p className="mb-4 text-blue-100">
                Не знаете, как правильно оформить документы? Мы поможем!
              </p>
              <a
                href="https://t.me/lutafx"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Написать в поддержку
              </a>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle2 className="text-green-600 mr-2" size={24} />
                Важно знать
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Все документы должны быть оригинальными или нотариально заверенными копиями</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Трудовой договор составляется в двух экземплярах</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Медосмотр проводится за счёт работодателя</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Испытательный срок для несовершеннолетних запрещён</span>
                </li>
              </ul>
            </div>

            <div className="card bg-red-50 border-2 border-red-200">
              <h3 className="text-xl font-bold mb-4 flex items-center text-red-900">
                <AlertCircle className="text-red-600 mr-2" size={24} />
                Запрещено
              </h3>
              <ul className="space-y-3 text-sm text-red-800">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Работа с вредными условиями труда</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Работа в ночное время (22:00-06:00)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Сверхурочная работа</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Работа в выходные и праздничные дни</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Командировки</span>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Полезные ссылки</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-blue-600 hover:underline">
                  → Трудовой кодекс РК (статьи о несовершеннолетних)
                </a>
                <a href="#" className="block text-blue-600 hover:underline">
                  → Где пройти медосмотр
                </a>
                <a href="#" className="block text-blue-600 hover:underline">
                  → Права подростков на работе
                </a>
                <a href="#" className="block text-blue-600 hover:underline">
                  → Куда жаловаться при нарушениях
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
