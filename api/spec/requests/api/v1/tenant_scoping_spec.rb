# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Tenant Scoping & Unscoped Endpoints Characterization', type: :request do
  let!(:org_a) { create(:organization, scheme: 'org-a') }
  let!(:org_b) { create(:organization, scheme: 'org-b') }
  let!(:admin_a) { create(:user, :admin) }

  let!(:assessment_b) { create(:assessment, tenant_id: org_b.id, created_by: 999) }
  let!(:session_b) { create(:session, tenant_id: org_b.id, assessment: assessment_b) }
  let!(:portfolio_b) { create(:portfolio, session: session_b, generation_status: 'complete') }
  let!(:vacancy_a) { create(:vacancy, tenant_id: org_a.id, created_by: admin_a.id) }

  before do
    allow(FitGapGeneratorWorker).to receive(:perform_async)
  end

  describe 'Cross-Tenant Scoping Leak on Portfolios (GAP P0-3)' do
    it 'characterizes that regenerate_fitgap does not enforce tenant scoping and finds cross-tenant portfolio' do
      headers = authenticated_headers(admin_a, scheme: org_a.scheme)

      post "/api/v1/portfolios/#{portfolio_b.id}/regenerate_fitgap",
           params: { vacancy_id: vacancy_a.id }.to_json,
           headers: headers

      # Current code calls Portfolio.find(params[:id]) without tenant scoping,
      # so it accepts the foreign portfolio from org_b.
      expect(response).to have_http_status(:accepted)
      expect(json_body[:status]).to eq('generating')
    end
  end
end
