import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { Employee, getEmployees } from '../services/api';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadEmployees = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const result = await getEmployees(search, 1, 50);

      if (result.success) {
        setEmployees(result.employees);
      } else {
        setEmployees([]);
        setError(result.error || 'Unable to load employees.');
      }
    } catch (err) {
      console.error('Employees screen error:', err);
      setError('Unable to load employees.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [])
  );

  const handleSearch = () => {
    loadEmployees();
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const fullName =
      `${item.firstName || ''} ${item.lastName || ''}`.trim();

    return (
      <TouchableOpacity
        style={styles.employeeCard}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.firstName?.charAt(0) || 'E').toUpperCase()}
          </Text>
        </View>

        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName} numberOfLines={1}>
            {fullName || 'Employee'}
          </Text>

          <Text style={styles.employeeId}>
            {item.employeeId}
          </Text>

          <View style={styles.detailRow}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color="#64748B"
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.designation?.name || 'Designation not assigned'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name="business-outline"
              size={14}
              color="#64748B"
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.site?.name || 'Site not assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'ACTIVE'
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'ACTIVE'
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.status || 'UNKNOWN'}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Employees</Text>
          <Text style={styles.headerSubtitle}>
            VPHS HRMS Employee Management
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="people-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search employee ID, name, mobile..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                loadEmployees();
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.sectionTitle}>
              Employee List
            </Text>
            <Text style={styles.countText}>
              {employees.length} employee
              {employees.length === 1 ? '' : 's'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadEmployees(true)}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#008EA4"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color="#008EA4"
            />
            <Text style={styles.loadingText}>
              Loading employees...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={52}
              color="#DC2626"
            />

            <Text style={styles.errorTitle}>
              Unable to Load Employees
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadEmployees()}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : employees.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons
              name="people-outline"
              size={58}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No Employees Found
            </Text>

            <Text style={styles.emptyText}>
              No employees matched your search.
            </Text>
          </View>
        ) : (
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            renderItem={renderEmployee}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadEmployees(true)}
                tintColor="#008EA4"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#003B49',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#B9D7DD',
    fontSize: 12,
    marginTop: 3,
  },

  headerIcon: {
    marginLeft: 'auto',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#008EA4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  countText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E6F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingBottom: 30,
  },

  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDF3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00798B',
  },

  employeeInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  employeeId: {
    fontSize: 12,
    color: '#008EA4',
    fontWeight: '600',
    marginTop: 2,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  detailText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    marginLeft: 5,
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  activeText: {
    color: '#15803D',
  },

  inactiveText: {
    color: '#B91C1C',
  },

  chevron: {
    marginTop: 10,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  errorText: {
    marginTop: 7,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: '#008EA4',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  emptyText: {
    marginTop: 6,
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
  },
});