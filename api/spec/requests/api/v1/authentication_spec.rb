# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Authentication API Characterization', type: :request do
  let!(:org) { create(:organization, scheme: 'test-corp') }
  let!(:admin) { create(:user, :admin, email: 'admin@test.com', password: 'secretpassword') }
  let!(:member) { create(:user, role: 'user', email: 'member@test.com', password: 'secretpassword') }

  describe 'POST /api/v1/auth/login' do
    it 'authenticates admin successfully and returns token and user payload' do
      post '/api/v1/auth/login',
           params: { email: 'admin@test.com', password: 'secretpassword' }.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(json_body[:token]).to be_present
      expect(json_body[:user]).to include(
        id: admin.id,
        email: 'admin@test.com',
        role: 'admin'
      )
    end

    it 'rejects invalid credentials with 401 and errors envelope' do
      post '/api/v1/auth/login',
           params: { email: 'admin@test.com', password: 'wrongpassword' }.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:unauthorized)
      expect(json_body[:errors].first[:message]).to eq('Invalid email or password')
    end

    it 'characterizes GAP P0-2: rejects non-admin users with 401 even with valid password' do
      post '/api/v1/auth/login',
           params: { email: 'member@test.com', password: 'secretpassword' }.to_json,
           headers: { 'Content-Type' => 'application/json' }

      # Current code strictly requires user.role == 'admin'
      expect(response).to have_http_status(:unauthorized)
      expect(json_body[:errors].first[:message]).to eq('Invalid email or password')
    end

    it 'characterizes scheme resolution from X-Tenant-Scheme header' do
      post '/api/v1/auth/login',
           params: { email: 'admin@test.com', password: 'secretpassword' }.to_json,
           headers: {
             'Content-Type' => 'application/json',
             'X-Tenant-Scheme' => 'custom-tenant-scheme'
           }

      expect(response).to have_http_status(:ok)
      token = json_body[:token]
      decoded = JsonWebToken.decode(token)
      expect(decoded[:scheme]).to eq('custom-tenant-scheme')
    end
  end
end
