import React, { useState, useEffect } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { List, Clock, Terminal } from 'lucide-react';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <List className="mr-2" />
        Log Aktivitas
      </h1>
      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{activity.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(activity.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pl-16 text-sm text-gray-700">
                <p className="font-medium">Detail:</p>
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-xs overflow-x-auto">{JSON.stringify(activity.action_details, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
