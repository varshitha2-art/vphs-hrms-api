import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>VPHS HRMS</Text>
      <Text style={styles.subtitle}>Human Resource Management System</Text>
      <Text style={styles.admin}>Admin</Text>

      <TouchableOpacity
        style={styles.employeeButton}
        onPress={() => router.push('/employees')}
      >
        <Text style={styles.buttonText}>EMPLOYEES</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attendanceButton}
        onPress={() => router.push('/attendance')}
      >
        <Text style={styles.buttonText}>ATTENDANCE</Text>
      </TouchableOpacity>

<TouchableOpacity
  style={styles.payrollButton}
  onPress={() => router.push('/payroll')}
>
  <Text style={styles.buttonText}>PAYROLL</Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.buttonText}>EXPLORE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>SIGN OUT</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  payrollButton: {
  backgroundColor: '#7C3AED',
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: 'center',
  marginTop: 12,
},

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },

  admin: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 30,
  },

  employeeButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#D97706',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  attendanceButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#2563EB',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  exploreButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#059669',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  signOutButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#DC2626',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
