import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { logoutFromHrms } from '@/services/api';

const modules = [
  {
  title: 'Employees',
  icon: 'people-outline' as const,
  onPress: () => router.push('/employees'),
},
{ title: 'Attendance', icon: 'time-outline' as const },
  { title: 'Attendance', icon: 'time-outline' as const },
  { title: 'Leave', icon: 'calendar-outline' as const },
  { title: 'Payroll', icon: 'cash-outline' as const },
  { title: 'Payslips', icon: 'document-text-outline' as const },
  { title: 'PF & ESI', icon: 'shield-checkmark-outline' as const },
  { title: 'Clients & Sites', icon: 'business-outline' as const },
  { title: 'Reports', icon: 'bar-chart-outline' as const },
  { title: 'Notifications', icon: 'notifications-outline' as const },
  { title: 'Settings', icon: 'settings-outline' as const },
];

export default function DashboardScreen() {
  const handleLogout = async () => {
    await logoutFromHrms();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>Welcome back</Text>
            <Text style={styles.title}>VPHS HRMS</Text>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>Admin</Text>
            <Text style={styles.userId}>VPHS-001</Text>
            <Text style={styles.userRole}>SUPER ADMIN</Text>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        {/* Section */}
        <Text style={styles.sectionTitle}>HRMS Modules</Text>

        {/* Modules */}
        <View style={styles.grid}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.title}
              style={styles.moduleCard}
              activeOpacity={0.8}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name={module.icon}
                  size={27}
                  color="#D97706"
                />
              </View>

              <Text style={styles.moduleTitle}>
                {module.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.logoutText}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          VPHS Services Pvt. Ltd. • HRMS Mobile Portal
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  smallText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userInfo: {
    flex: 1,
    marginLeft: 14,
  },

  userName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },

  userId: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },

  userRole: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  onlineText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  moduleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    minHeight: 125,
    justifyContent: 'center',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  moduleTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },

  logoutButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },

  footer: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 22,
  },
});